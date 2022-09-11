import { parse } from 'yaml'
import { RustFileGenerator, RustRenderCompleteModelOptions, RUST_COMMON_PRESET, defaultRustRenderCompleteModelOptions, RustPackageFeatures } from '../../src/generators';

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

function replaceExt(file: string, ext: string) : string {
  const basename = path.basename(file, path.extname(file))
  return path.join(path.dirname(file), basename + ext)
}

export async function generate(file: string): Promise<void> {
  const spec = parse(await fs.readFile(file, 'utf8'));

  const generator = new RustFileGenerator({
    presets: [
      {
        preset: RUST_COMMON_PRESET, options: {
          implementNew: true,
          implementDefault: true,
        }
      }
    ]
  });

  const outDir = path.join(__dirname, 'rust/' + replaceExt(file, ''));

  const models = await generator.generateToPackage(spec, outDir, {
    ...defaultRustRenderCompleteModelOptions,
    supportFiles: true, // generate Cargo.toml and lib.rs
    package: {
      packageName: 'asyncapi-rs-example',
      packageVersion: '1.0.0',
      // set authors, homepage, repository, and license
      authors: ['AsyncAPI Rust Champions'],
      homepage: 'https://www.asyncapi.com/tools/modelina',
      repository: 'https://github.com/asyncapi/modelina',
      license: 'Apache-2.0',
      description: 'Rust models generated by AsyncAPI Modelina',
      // support 2018 editions and up
      edition: '2018',
      // enable serde_json
      packageFeatures: [RustPackageFeatures.json] as RustPackageFeatures[]
    }
  } as RustRenderCompleteModelOptions);
}

generate('api_example.yml');
