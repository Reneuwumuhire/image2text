import getText from "@/lib/getText";
import { IncomingForm } from "formidable";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const config = {
	api: {
		bodyParser: false,
	},
};

const upload = async (req: any, res: any) => {
	// Set CORS headers
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

	try {
		const form = new IncomingForm({
			multiples: true,
			keepExtensions: true,
		});

		form.once("error", (err) => {
			console.error("Formidable error:", err);
			throw String(JSON.stringify(err, null, 2));
		});

		form.on("fileBegin", (name, file: any) => {
			console.log("Start uploading:", file.originalFilename);
		});

		form.once("end", () => {
			console.log("Upload done!");
		});

		await new Promise<void>((resolve, reject) => {
			form.parse(req, async (err, fields, files: any) => {
				if (err) {
					reject(err);
					return;
				}

				try {
					const oldPath = files.file[0].filepath;
					const destinationDirectory = path.join("public", "uploads");
					// Ensure that the destination directory exists, create it if necessary
					await fs.mkdir(destinationDirectory, { recursive: true });
					const newPath = path.join(destinationDirectory, uuidv4());
					// add the extension to the new path
					let extension = path.extname(files.file[0].originalFilename);
					// if (!extension) {
					// 	extension = ".jpeg";
					// }
					// move the file to the new path and rename it
					await fs.rename(oldPath, newPath + extension);
					const text = await getText(newPath + extension);
					req.form = { fields, files };
					// Set the text in the response
					res.text = text;
					resolve();
				} catch (error) {
					reject(error);
				}
			});
		});

		return res.status(200).send({ text: res.text });
	} catch (error) {
		console.error("Upload error:", error);
		return res.status(403).send(error);
	}
};
function handler(req: any, res: any) {
	try {
		if (req.method === "POST") {
			return res.status(200).send(req.form);
		} else {
			throw String("Method not allowed");
		}
	} catch (error) {
		return res.status(400).json({ message: JSON.stringify(error, null, 2) });
	}
}

export default upload;
