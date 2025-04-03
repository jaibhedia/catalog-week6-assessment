const fs = require('fs');
const path = require('path');

const artifactPath = path.join(__dirname, '../artifacts/contracts/Token.sol/MyToken.json');
const targetPath = path.join(__dirname, '../frontend/src/utils/contractArtifact.js');

const artifact = require(artifactPath);


const fileContent = `// Auto-generated from Hardhat compilation
export const MyTokenArtifact = ${JSON.stringify(artifact, null, 2)};
`;

fs.writeFileSync(targetPath, fileContent);
console.log(`Contract artifact copied to ${targetPath}`);