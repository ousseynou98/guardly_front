"use client";

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, Typography, Box, Slider, TextField, Button } from '@mui/material';
import { Alarm } from 'iconsax-react'; 
import * as fabric from 'fabric'; // Import everything from fabric.js



interface CameraDetails {
  id: number;
  adresse_ip: string;
  localisation: string;
  statut: string;
  modele: string;
  fabricant: string;
  zones_detection: any;
}

const ConfigCamera = ({ cameraId }: { cameraId: string }) => {
  const [cameraDetails, setCameraDetails] = useState<CameraDetails | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());
  const [motionDetected, setMotionDetected] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 24]); // Default time range: 00:00 - 24:00
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

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
        const img = new Image();
        img.src = url;
        img.onload = () => {
          if (fabricCanvas) {
            fabricCanvas.clear();
            const imgFabric = new fabric.Image(img, {
              left: 0,
              top: 0,
              scaleX: fabricCanvas.width / img.width,
              scaleY: fabricCanvas.height / img.height,
              selectable: false,
            });
            fabricCanvas.add(imgFabric);
          }
        };
      } else {
        const message = JSON.parse(event.data);
        if (message.motion_detected) {
          setMotionDetected(true);
          setTimeout(() => setMotionDetected(false), 1000);
        }
      }
    };

    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => {
      ws.close();
      clearInterval(timer);
    };
  }, [cameraId, fabricCanvas]);

useEffect(() => {
  if (canvasRef.current && !fabricCanvas) {
    const canvas = new fabric.Canvas(canvasRef.current, {
      selection: true,
    });
    
    setFabricCanvas(canvas);

    // Add rectangle selection
    canvas.on('mouse:down', function (event: any) { // fallback type
      const pointer = canvas.getPointer(event.e);
      const rect = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: 'rgba(255,0,0,0.3)',
      });
  
      canvas.add(rect);
  
      canvas.on('mouse:move', function (moveEvent: any) { // same here
          const pointer = canvas.getPointer(moveEvent.e);
          rect.set({
              width: Math.abs(pointer.x - rect.left),
              height: Math.abs(pointer.y - rect.top),
          });
          canvas.renderAll();
      });
  });
  
  }

  return () => {
    if (fabricCanvas) {
      fabricCanvas.dispose();
      setFabricCanvas(null);
    }
  };
}, [fabricCanvas]);


  const handleTimeRangeChange = (event: Event, newValue: number | number[]) => {
    setTimeRange(newValue as [number, number]);
  };

  const handleSubmitConfig = () => {
    // Retrieve detection zone
    if (fabricCanvas) {
      const rects = fabricCanvas.getObjects('rect');
      if (rects.length > 0) {
        const rect = rects[0] as fabric.Rect;
        const detectionZone = {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        };
        console.log("Zone de détection : ", detectionZone);
        // Call API to save detection zone
        if (cameraDetails) {
          fetch(`http://127.0.0.1:8000/cameras/${cameraId}/zones`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zones_detection: detectionZone }),
          }).then(() => {
            console.log("Zone de détection mise à jour !");
          }).catch(err => {
            console.error("Erreur lors de la mise à jour de la zone de détection", err);
          });
        }
      }
    }

    // Handle time range
    console.log(`Plage horaire de détection : de ${timeRange[0]}h à ${timeRange[1]}h`);
  };

  if (!cameraDetails) {
    return <Typography>Chargement des détails de la caméra...</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 4, mt: 2 }}>
      {/* Card 1: Video Feed with Detection Zone */}
      <Card sx={{ flex: 8, height: '75vh', overflow: 'hidden', borderRadius: '16px' }}>
        <CardContent sx={{
          position: 'relative', 
          height: '100%', 
          p: 0,
          '&:last-child': { paddingBottom: 0 } 
        }}>
          <Typography variant="h5" sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10, color: 'white' }}>
            {cameraDetails.localisation} - <span style={{ color: 'red' }}>● Lives</span>
          </Typography>
          <Typography variant="caption" sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, color: 'white', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', p: '2px 6px' }}>
            {time}
          </Typography>
          <Alarm size="32" color={motionDetected ? 'red' : 'grey'} style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 10, animation: motionDetected ? 'blink 1s linear infinite' : 'none' }} />
          <canvas ref={canvasRef} width={800} height={600} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
        </CardContent>
      </Card>

      {/* Card 2: Time Range Selection */}
      <Card sx={{ flex: 4, height: '75vh', borderRadius: '16px' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Plage horaire de détection
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Définir la plage horaire :</Typography>
            <Slider
              value={timeRange}
              onChange={handleTimeRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={24}
              step={1}
              marks={[{ value: 0, label: '00h' }, { value: 12, label: '12h' }, { value: 24, label: '24h' }]}
            />
            <TextField label="Heure de début" value={`${timeRange[0]}:00`} disabled />
            <TextField label="Heure de fin" value={`${timeRange[1]}:00`} disabled />
            <Button variant="contained" color="primary" onClick={handleSubmitConfig}>
              Enregistrer la configuration
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ConfigCamera;
