// src/components/VenueSelect.tsx
import { useEffect, useState } from "react";
import { Form, Select, message } from "antd";
import type{ VenueOptions} from "../../../interface/venue";
import { venueoption } from "../../../services/https/concert";

type Props = {
  name?: string;       
  label?: string;      
  required?: boolean;  
};


export default function VenueSelect({ name="venue_id", label="Venue", required=true }: Props) {
  const [opts, setvenue] = useState<VenueOptions[]>([]);

const putvenue = async() =>{
  try{
    const rowsvenue = await venueoption();
    setvenue(rowsvenue);
  }
  catch (error){
      console.error("error : ",error);
    }
  
};

  useEffect(() => {
    putvenue();
  }, []);

  return (
    <Form.Item
      name={name}
      label={label}
      rules={required ? [{ required: true, message: "โปรดเลือกสถานที่" }] : undefined}
    >
      <Select
        showSearch
        placeholder="เลือกสถานที่"
        optionFilterProp="label"
        options={opts.map(v => ({ value: v.id, label: v.venue_name }))}
      />
    </Form.Item>
  );
}
