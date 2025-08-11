// @ts-check
const { generateSchema, generateOutput } = require('@gql.tada/cli-utils');
const { join } = require('path');

const b2bGraphqlApiDomain = process.env.B2B_API_HOST ?? 'api-b2b.bigcommerce.com';

function getB2BToken() {
  const token = process.env.B2B_API_TOKEN;
  if (!token) throw new Error('Missing B2B API token');
  return token;
}

async function generate() {
  const tsconfig = join(__dirname, '../tsconfig.json');
  try {
    await generateSchema({
      input: `https://${b2bGraphqlApiDomain}/graphql`,
      headers: { Authorization: `Bearer ${getB2BToken()}` },
      output: join(__dirname, '../bigcommerce-b2b.graphql'),
      tsconfig: join(__dirname, '../tsconfig.graphql.json'),
    });

    await generateOutput({ tsconfig });
      
    console.log('✓ B2B schema downloaded (types will be available via tadaOutputLocation)');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

generate();
