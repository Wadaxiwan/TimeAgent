"use client"
import { useState } from 'react';

export default function PasteArea() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = async (event: any) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    try {
      const formData = new FormData();
      formData.append('file', file); 

      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log("response:", response);
      if (response.ok) {
        setUploadSuccess(true);
      } else {
        alert('文件上传失败。');
      }
    } catch (error) {
      console.error('文件上传错误:', error);
      alert('文件上传错误。');
    }
  };
  
    return (
      <div className="bg-background text-foreground p-6 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground">拖放 PDF、DOCX 或 TXT 文件进行上传。</p>
          </div>
          <div
            className={`border-2 border-dashed border-primary-foreground rounded-md p-8 flex flex-col items-center justify-center space-y-4 cursor-pointer transition-colors ${
              uploadSuccess ? 'border-green-500' : 'hover:border-primary'
            }`}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <CloudUploadIcon className="w-8 h-8 text-primary-foreground" />
            {!uploadSuccess ? (
              <p className="text-muted-foreground">
                拖放文件到这里或点击选择
              </p>
            ) : (
              <p className="text-green-500">文件上传成功！</p>
            )}
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              id="fileInput"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          <div className="space-y-2">
            {selectedFile && (
              <div className="font-medium">{selectedFile.name}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

function CloudUploadIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M12 12v9" />
      <path d="m16 16-4-4-4 4" />
    </svg>
  );
}
