import axios from 'axios';
import {from,merge,of,ReplaySubject,throwError} from 'rxjs';
import {
  filter,
  map,
  mapTo,
  mergeMap,
  scan,
  share,
  take,
  tap
} from 'rxjs/operators';

import shortenChunks from '../internals/shortenChunks.js';

const errors = {
  apiKeyRequired: () => new Error('apiKey is required'),
};

const sendRecognitionRequest = function sendRecognitionRequest({
  apiKey,
  url = 'https://api.assemblyai.com/v2/stream'
}) {
  return fileChunk => {
    console.log('sending request');
    const reqParams = {
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: apiKey,
      },
      data: {
        audio_data: fileChunk.toString('base64'),
      }
    };
    const promise = axios(reqParams);
    const obs$ = from(promise);
    return obs$;
  };
};

const addIndex = () => (acc, next) => [next, acc[1] + 1];

const bufferUntilIndexReached = nextChunkIndex$ => ([chunk, index]) => (
  nextChunkIndex$.pipe(
    filter(i => i === index),
    mapTo(chunk)
  )
);

const toAssemblyAI = function toAssemblyAI({
  apiKey = process.env.ASSEMBLY_AI_API_KEY, // REQUIRED
  chunkSize = 32000 * 15, // 15-second chunks, assuming 16-bit PCM data is 2 bytes/second @ sample rate of 16Khz
  addDelay = true,
}) {
  if (!apiKey) return throwError(errors.apiKeyRequired());
  return fileChunk$ => {
    const pump$ = new ReplaySubject(1);
    const nextChunkIndex$ = merge(of(0), pump$).pipe(share());
    // AssemblyAI's stream API endpoint limits audio files to 15 seconds
    const chunkToTranscribe$ = fileChunk$.pipe(
      share(),
      shortenChunks(chunkSize),
      scan(addIndex(), [null, -1]),
      // force chunks to wait until the prior chunk has been processed
      mergeMap(bufferUntilIndexReached(nextChunkIndex$))
    );
    const response$ = chunkToTranscribe$.pipe(
      map(sendRecognitionRequest({apiKey})),
      mergeMap(res$ => res$),
      tap(r => console.log('res', r.data)),
      scan(addIndex(), [null, -1]),
      tap(([res, i]) => pump$.next(i + 1)),
      tap(x => console.log('pumped', x[1])),
      map(([res]) => res.data)
    );
    return response$;
  };
};

export default toAssemblyAI;
