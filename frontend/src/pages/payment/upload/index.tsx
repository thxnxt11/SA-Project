import { useState } from "react";
import { Modal, Button, message, Form, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";

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
  const [fileList, setFileList] = useState<any[]>([]);

  const handleUploadClick = () => {
    if (!selectedFile) {
      message.warning("กรุณาเลือกไฟล์ก่อนกดอัปโหลด");
      return;
    }
    onUpload(selectedFile);
  };

  const handleFileChange = (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1); // จำกัดให้มีแค่ไฟล์เดียวในรายการ

    if (newFileList.length > 0) {
      setSelectedFile(newFileList[0].originFileObj as File);
    } else {
      setSelectedFile(null);
    }

    setFileList(newFileList);
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
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
        <Form.Item
          name="upload"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: "กรุณาอัปโหลดรูปภาพ" }]}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Upload
            action="/upload.do"
            listType="picture-card"
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={() => false} // ป้องกันการอัปโหลดอัตโนมัติ
            style={{ width: 200, height: 200 }}
          >
            {fileList.length >= 1 ? null : (
              <button
                style={{
                  color: "inherit",
                  cursor: "inherit",
                  border: 0,
                  background: "none",
                }}
                type="button"
              >
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </button>
            )}
          </Upload>
        </Form.Item>
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
