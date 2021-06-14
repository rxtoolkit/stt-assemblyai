# @buccaneerai/stt-assemblyai
> 👂 An RxJS operator for real-time speech-to-text (STT/S2T) streaming using the AssemblyAI STT API.

## Installation
This is a private package. It requires setting up access in your npm config.

```bash
yarn add @buccaneerai/stt-assemblyai
```

## Demo
To run the demo pipeline:
```bash
yarn demo:run <myInstanceId> --secret <secretAccessKey> --write-output
```

## API

### `toAssemblyAI`
```js
import {from} from 'rxjs';
import {toAssemblyAI} from '@buccaneerai/stt-assemblyai';
import {fromFile} from '@bottlenose/rxfs';

const filePath = 'path/to/audio-file.linear16';
// For a full list of options, see ./src/lib/toIBM.js
const params = {
  apiKey: process.env.ASSEMBLY_AI_API_KEY,
};
const audioChunk$ = fromFile(filePath);
const output$ = string$.pipe(toAssemblyAI(params));
output$.subscribe(console.log); 
// Output:
// {...responseFromAPI}
// {...anotherResponseFromAPI}
```

## Contributing, Deployments, etc.
See [CONTRIBUTING.md](https://github.com/buccaneerai/stt-assemblyai/blob/master/docs/CONTRIBUTING.md) file for information about deployments, etc.

## References
- [AssemblyAI docs](https://docs.assemblyai.com/api-ref/v2-stream)
