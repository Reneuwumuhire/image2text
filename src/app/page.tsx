"use client";
import { createRef, useEffect, useRef, useState } from "react";
import { Camera } from "react-camera-pro";
import { v4 as uuidv4 } from "uuid";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import getText from "@/lib/getText";
export default function Home() {
	const [extractedText, setExtractedText] = useState("");
	const [image, setImage] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [cropData, setCropData] = useState<any>(null);
	const cropperRef = createRef<ReactCropperElement>();
	const camera = useRef<any>(null);

	useEffect(() => {
		setIsLoading(false);
	}, []);
	const getCropData = () => {
		if (typeof cropperRef.current?.cropper !== "undefined") {
			setCropData(cropperRef.current?.cropper.getCroppedCanvas().toDataURL());
		}
	};
	// create a function that save captured image from image state into public folder
	const onSubmit = async (event: any) => {
		event.preventDefault();
		setIsLoading(true);
		console.log("submitting", image);
		console.log("cropData", cropData);
		if (cropData) {
			try {
				const formData = new FormData();
				// Convert the data URL to a Blob
				const blob = await fetch(cropData).then((res) => res.blob());

				// Create a File from the Blob
				const file = new File([blob], `${uuidv4()}.png`, { type: "image/png" });
				// // append the file to the form data
				// formData.append("file", file);

				// const response = await fetch("/api/upload", {
				// 	method: "POST",
				// 	body: formData,
				// });

				// if (!response.ok) {
				// 	throw new Error(`HTTP error! Status: ${response.status}`);
				// }

				// const data = await response.json();
				const data = await getText(cropData);
				setExtractedText(data);
			} catch (error) {
				console.error("Error taking photo or uploading:", error);
			} finally {
				setIsLoading(false);
			}
		}
	};
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-2">
			<div className=" flex flex-col justify-between space-y-4 w-full ">
				{extractedText ? (
					<pre contentEditable>{extractedText}</pre>
				) : (
					<div>
						{image && (
							<Cropper
								ref={cropperRef}
								style={{ height: 400, width: "100%" }}
								zoomTo={0}
								initialAspectRatio={1}
								preview=".img-preview"
								src={image}
								viewMode={1}
								minCropBoxHeight={10}
								minCropBoxWidth={10}
								background={false}
								responsive={true}
								autoCropArea={1}
								checkOrientation={false}
								guides={true}
							/>
						)}

						{!image && (
							<Camera
								ref={camera}
								errorMessages={{
									noCameraAccessible: undefined,
									permissionDenied: undefined,
									switchCamera: undefined,
									canvas: undefined,
								}}
								facingMode="environment"
								aspectRatio={4 / 3}
							/>
						)}
					</div>
				)}
				{!image ? (
					<button
						onClick={async () => {
							console.log("Button Clicked");
							if (camera.current) {
								const photo = await camera.current.takePhoto();
								setImage(photo);
							}
						}}
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
						Take photo
					</button>
				) : (
					<button
						onClick={() => {
							getCropData();
						}}
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
						Crop image
					</button>
				)}
				<form
					className="flex flex-col justify-between"
					onSubmit={(e: any) => {
						setIsLoading(true);
						onSubmit(e);
					}}>
					{/* use the taken photo as the input value */}
					{/* <input ref={fileInputRef} type="file" multiple /> */}
					<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">
						{isLoading ? "Uploading..." : "Upload"}
					</button>
				</form>
			</div>
		</main>
	);
}

const HocrViewer = ({ hocr }: any) => {
	// Split hOCR content into lines
	const lines = hocr.split("\n");

	return (
		<>
			{lines.map((line: any, index: number) => (
				<pre contentEditable key={index} dangerouslySetInnerHTML={{ __html: line }} />
			))}
		</>
	);
};
