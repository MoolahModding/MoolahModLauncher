const AdmZip = require('adm-zip');

function readAndExtractMeta(zipFilePath) {
  try {
    // Initialize AdmZip with the ZIP file
    const zip = new AdmZip(zipFilePath);

    // Get the content of the "meta.json" file
    const metaEntry = zip.getEntry('meta.json');

    if (metaEntry) {
      // Extract the content as a buffer
      const metaContentBuffer = zip.readFile(metaEntry);

      // Convert the buffer to a string (assuming it's a JSON file)
      const metaContentString = metaContentBuffer.toString('utf8');

      // Parse the JSON content if needed
      const metaData = JSON.parse(metaContentString);

      // Return the meta data or the raw content string
      return metaData;
    } else {
      console.log('meta.json not found in the ZIP file');
	  return 'ERROR';
    }
  } catch (error) {
    console.log(`Error reading or extracting ZIP file: ${error.message}`);
	return 'ERROR';
  }
}

module.exports = {
  readAndExtractMeta,
};
