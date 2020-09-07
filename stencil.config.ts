import path from 'path';
import fs from 'fs';
import url from 'url';
import { Config } from '@stencil/core';
import eleventyConfig from './.eleventy.js';


const dev = process.env.NODE_ENV === 'development'

const config11ty = eleventyConfig();
const dir = config11ty.dir && config11ty.dir.output ? config11ty.dir.output : 'public';
const dataDir = config11ty.dir && config11ty.dir.data ? path.resolve(config11ty.dir.input, config11ty.dir.data) : 'src/data';

const metadata = JSON.parse(fs.readFileSync(path.join(dataDir, 'metadata.json'), 'utf-8'));

const baseUrl = dev ? 'http://localhost:4488' 
                : metadata && metadata.url ? metadata.url : 'http://localhost:4488';

const namespace = url.parse(baseUrl).hostname.replace('.', '-');

export const config: Config = {
  namespace,
  outputTargets: [
    {
      type: 'www',
      baseUrl,
      dir,
      serviceWorker: null, // disable service workers
    },
  ],
};

