import { useState, useCallback } from 'react';
import MlkitOcr from 'react-native-mlkit-ocr';

export function useOCR() {
  const [processing, setProcessing] = useState(false);

  const recognize = useCallback(async (uri: string): Promise<string> => {
    setProcessing(true);
    try {
      const blocks = await MlkitOcr.detectFromUri(uri);
      return blocks.map((block) => block.text).join('\n');
    } finally {
      setProcessing(false);
    }
  }, []);

  return { recognize, processing };
}
