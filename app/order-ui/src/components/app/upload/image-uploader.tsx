import { XIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export interface ImageUploaderProps {
    initialImage: string | null;
    onFileChange: (file: File | null) => void;
}

export const ImageUploader = ({ initialImage, onFileChange }: ImageUploaderProps) => {
    const [preview, setPreview] = useState(initialImage || null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            onFileChange(file); // pass file to parent
        }
    }, [onFileChange]);

    useEffect(() => {
        setPreview(initialImage);
    }, [initialImage]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': []
        },
        multiple: false
    });

    const handleClear = () => {
        setPreview(null);
        onFileChange(null); // Notify parent
    };

    return (
        <div className="flex flex-col items-center gap-2 w-full">
            <div
                {...getRootProps()}
                className={`w-full h-20 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p className='text-xs text-gray-500'>Drop the image...</p>
                ) : (
                    <p className='text-xs text-gray-500'>Click or drag image here</p>
                )}
            </div>

            {preview && (
                <div className="relative w-full">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-56 object-contain rounded-md border"
                    />
                    <XIcon className='absolute top-2 right-2 text-red-500 cursor-pointer' onClick={handleClear} />
                </div>
            )}
        </div>
    );
};