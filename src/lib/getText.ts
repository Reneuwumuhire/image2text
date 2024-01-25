import { createWorker } from "tesseract.js";

const getText = async (image: any): Promise<string> => {
	const worker = await createWorker();
	try {
		await worker.load();

		const ret = await worker.recognize(image);

		if (ret && ret.data && ret.data.text) {
			return ret.data.text;
		} else {
			throw new Error("No text recognized");
		}
	} catch (error) {
		console.error("Error recognizing text:", error);
		throw error;
	} finally {
		await worker.terminate();
	}
};

export default getText;
