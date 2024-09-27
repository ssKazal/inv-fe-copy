import Compressor from "compressorjs";

function FileToBase64(file) {
  return new Promise((resolve, reject) => {
    // To pre-compress a image on the client side before uploading it
    new Compressor(file, {
      quality: 0.6, // 	if input size is '2.12 MB' then converted size will be '694.99 KB'
      success: (result) => {
        // Result here is the compressed file
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;

        // Read the compressed file as data URL
        reader.readAsDataURL(result);
      },
    });
  });
}

export default FileToBase64;
