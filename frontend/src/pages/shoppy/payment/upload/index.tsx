import { useState } from "react";
import { Modal, Button, message } from "antd";
import UploadImage from "../../../../component/upload-img";
// import type { RcFile } from "antd/es/upload";

type UploadModalProps = {
  visible: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  loading: boolean;
};

export const UploadModal = ({
  visible,
  onClose,
  onUpload,
  loading,
}: UploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleUploadClick = () => {
    
    if (!selectedFile) {
      message.warning("กรุณาเลือกไฟล์ก่อนกดอัปโหลด");
      return;
    }
    onUpload(selectedFile);
  };

  return (
    <Modal
      open={visible}
      title="📤 อัปโหลดรูปภาพ"
      onCancel={onClose}
      footer={null}
      centered
    >
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        <p style={{ marginBottom: 24, color: "#888" }}>
          กรุณาอัปโหลดภาพหลักฐานการชำระเงิน เช่น สลิปชำระเงิน
        </p>
        <UploadImage onFileSelect={handleFileSelect} />
        <Button
          type="primary"
          size="large"
          block
          style={{ marginTop: 24 }}
          loading={loading}
          onClick={handleUploadClick}
        >
          Upload
        </Button>
      </div>
    </Modal>
  );
};