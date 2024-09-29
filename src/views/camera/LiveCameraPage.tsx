"use client";

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Alarm } from 'iconsax-react'; // Import Alarm icon from iconsax-react

interface CameraDetails {
  id: number;
  adresse_ip: string;
  localisation: string;
  statut: string;
  modele: string;
  fabricant: string;
  zones_detection: any;
}

const LiveCamera = ({ cameraId }: { cameraId: string }) => {
  const [cameraDetails, setCameraDetails] = useState<CameraDetails | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());
  const [motionDetected, setMotionDetected] = useState<boolean>(false);

  useEffect(() => {
    const fetchCameraDetails = async () => {
      const response = await fetch(`http://127.0.0.1:8000/cameras/${cameraId}`);
      const data: CameraDetails = await response.json();
      setCameraDetails(data);
    };

    fetchCameraDetails();

    const ws = new WebSocket(`ws://127.0.0.1:8000/camera/${cameraId}/live`);
    ws.onmessage = event => {
      if (event.data instanceof Blob) {
        const url = URL.createObjectURL(event.data);
        if (imgRef.current) {
          imgRef.current.src = url;
        }
      } else {
        const message = JSON.parse(event.data);
        if (message.motion_detected) {
          setMotionDetected(true);
          setTimeout(() => setMotionDetected(false), 1000); // Flash for 1 second on detection
        }
      }
    };

    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000); // Update time every second

    return () => {
      ws.close();
      clearInterval(timer);
    };
  }, [cameraId]);

  if (!cameraDetails) {
    return <Typography>Chargement des détails de la caméra...</Typography>;
  }

  return (
    <Card sx={{ width: '85%', height: '75vh', overflow: 'hidden', borderRadius: '16px', m: 'auto', mt: 2 }}>
      <CardContent sx={{
    position: 'relative', 
    height: '100%', 
    p: 0,
    '&:last-child': { // This targets the pseudo-class that applies padding to the last child
      paddingBottom: 0 // Override the default padding provided by MUI
    }
  }}>
        <Typography variant="h5" sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10, color: 'white' }}>
          {cameraDetails.localisation} - <span style={{ color: 'red' }}>● Live</span>
        </Typography>
        <Typography variant="caption" sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, color: 'white', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', p: '2px 6px' }}>
          {time}
        </Typography>
        <Alarm size="32" color={motionDetected ? 'red' : 'grey'} style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 10, animation: motionDetected ? 'blink 1s linear infinite' : 'none' }} />
        <img ref={imgRef} alt="Live Camera Feed" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
      </CardContent>
    </Card>
  );
};

export default LiveCamera;

// Add the blinking keyframes to your CSS or in a global style component
// For example in your App.css or theme:
/*
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}
*/
