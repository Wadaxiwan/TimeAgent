// pages/display.js

import { fetchContent } from '@/app/lib/actions';
import React, { useEffect } from 'react';

let jsonData = {
  "black_list": [],
  "punc": [
    [
      323,
      "远",
      "",
      "疑似句末点号缺失"
    ]
  ],
  "leader": [],
  "org": [],
  "pol": [],
  "grammar_pc": [],
  "order": [],
  "idm": [],
  "word": [],
  "char": [
    [
      7,
      "装",
      "妆",
      "char"
    ]
  ],
  "redund": [],
  "miss": [],
  "dapei": [],
  "number": [],
  "addr": [],
  "name": []
};

interface DisplayJSONProps {
    docID: string; // 声明子组件需要的参数类型
  }

const  DisplayJson: React.FC<DisplayJSONProps> =  (props) => {
    // const data = await fetchContent(props.docID, 'correction');
    useEffect(() => {
        async function loadCorrection() {
          try {
            const tmpData = await fetchContent(props.docID, 'correction');
            jsonData = JSON.parse(tmpData.content);
            // if (data.content) {
            //   setCorrection(data.content);
            // }
          } catch (error) {
            console.error('Failed to fetch correction:', error);
          }
        }
    
        loadCorrection();
      });
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Correction Advices</h1>
      <div style={{
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '20px'
      }}>
        {Object.keys(jsonData).map((key) => (
          <div key={key} style={{ marginBottom: '20px' }}>
            <h2>{key}</h2>
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
              {jsonData[key].length === 0 ? (
                <li style={{ color: '#888' }}>No data</li>
              ) : (
                jsonData[key].map((item, index) => (
                  <li key={index} style={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '10px',
                    marginBottom: '10px'
                  }}>
                    {Array.isArray(item) ? item.join(', ') : item.toString()}
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisplayJson;
