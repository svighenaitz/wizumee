import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';

const FileViewer = dynamic(() => import('react-file-viewer'), {
  ssr: false,
})

const file = '/CVExample.docx'
const type = 'docx'
const DocxRenderer = () => {

  function onError(e) {
    console.error(e, 'error in file-viewer');
  }

  return <FileViewer
    fileType={type}
    filePath={file}
    errorComponent={<div>errore opssss</div>}
    onError={onError} />
};

export default DocxRenderer;