"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, Typography, Box, Slider, TextField, Button } from '@mui/material';
import { Alarm } from 'iconsax-react';
import { ReactSketchCanvas } from "react-sketch-canvas";

interface CameraDetails {
  id: number;
  adresse_ip: string;
  localisation: string;
  statut: string;
  modele: string;
  fabricant: string;
  zones_detection: any;
  captured_image?: string; // Champ de l'image capturée en Base64
}

const ConfigCamera = ({ cameraId }: { cameraId: string }) => {
  const [cameraDetails, setCameraDetails] = useState<CameraDetails | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());
  const [motionDetected, setMotionDetected] = useState<boolean>(false);
  const [isImageCaptured, setIsImageCaptured] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 24]);

  const sketchCanvasRef = useRef<any>(null); // Ref pour ReactSketchCanvas

  // Fetch camera details and WebSocket for live stream
  // useEffect(() => {
  //   const fetchCameraDetails = async () => {
  //     const response = await fetch(`http://127.0.0.1:8000/cameras/${cameraId}`);
  //     const data: CameraDetails = await response.json();
  //     setCameraDetails(data);

  //     // Charger l'image capturée et les zones de détection si elles existent
  //     if (data.captured_image) {
  //       setCapturedImage(data.captured_image);
  //       setIsImageCaptured(true);

  //       // Charger les zones de détection sur le canvas si elles sont présentes
  //       if (data.zones_detection) {
  //         sketchCanvasRef.current.loadPaths(data.zones_detection.drawingData);
  //       }
  //     }
  //   };

  //   fetchCameraDetails();

  //   const ws = new WebSocket(`ws://127.0.0.1:8000/camera/${cameraId}/live`);
  //   ws.onmessage = event => {
  //     if (event.data instanceof Blob && imgRef.current && !isImageCaptured) {
  //       const url = URL.createObjectURL(event.data);
  //       imgRef.current.src = url; // Affiche le flux en direct
  //     } else {
  //       try {
  //         const message = JSON.parse(event.data);
  //         if (message.motion_detected) {
  //           setMotionDetected(true);
  //           setTimeout(() => setMotionDetected(false), 1000); // Flash pour 1 seconde
  //         }
  //       } catch (error) {
  //         console.error("Error parsing JSON message:", error);
  //       }
  //     }
  //   };

  //   const timer = setInterval(() => {
  //     setTime(new Date().toLocaleTimeString());
  //   }, 1000); // Mise à jour de l'heure chaque seconde

  //   return () => {
  //     ws.close();
  //     clearInterval(timer);
  //   };
  // }, [cameraId, isImageCaptured]);
  useEffect(() => {
    const fetchCameraDetails = async () => {
      const response = await fetch(`http://127.0.0.1:8000/cameras/${cameraId}`);
      const data: CameraDetails = await response.json();
      setCameraDetails(data);
  
      // Load captured image and detection zones if they exist
      if (data.captured_image) {
        setCapturedImage(data.captured_image);
        setIsImageCaptured(true);
  
        // Wait for the component to mount before loading paths
        setTimeout(() => {
          if (data.zones_detection && sketchCanvasRef.current) {
            sketchCanvasRef.current.loadPaths(data.zones_detection.drawingData);
          }
        }, 100); // Adjust delay as needed
      }
    };
  
    fetchCameraDetails();
  
    const ws = new WebSocket(`ws://127.0.0.1:8000/camera/${cameraId}/live`);
    ws.onmessage = event => {
      if (event.data instanceof Blob && imgRef.current && !isImageCaptured) {
        const url = URL.createObjectURL(event.data);
        imgRef.current.src = url; // Display live feed
      } else {
        try {
          const message = JSON.parse(event.data);
          if (message.motion_detected) {
            setMotionDetected(true);
            setTimeout(() => setMotionDetected(false), 1000); // Flash for 1 second
          }
        } catch (error) {
          console.error("Error parsing JSON message:", error);
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
  }, [cameraId, isImageCaptured]);
  

  // Capture image from live stream
  const handleCaptureImage = () => {
    if (imgRef.current) {
      const canvas = document.createElement('canvas');
      
      // Réduire la taille de l'image pour éviter un Data URL trop volumineux
      const scaleFactor = 0.5; // Ajuste cette valeur pour redimensionner l'image
      canvas.width = imgRef.current.naturalWidth * scaleFactor;
      canvas.height = imgRef.current.naturalHeight * scaleFactor;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        console.log("Data URL:", dataUrl); // Affiche l'URL pour vérifier
        setCapturedImage(dataUrl);
        setIsImageCaptured(true);
      }
    }
  };

  const handleResetToLive = () => {
    setCapturedImage(null);
    setIsImageCaptured(false); // Retour au flux vidéo en direct
    sketchCanvasRef.current?.clearCanvas(); // Efface le dessin
  };

  // Gère les changements de la plage horaire
  const handleTimeRangeChange = (event: Event, newValue: number | number[]) => {
    setTimeRange(newValue as [number, number]);
  };

  // Enregistre le dessin et met à jour zones_detection et captured_image
  const handleSaveDrawing = async () => {
    try {
      const drawingData = await sketchCanvasRef.current.exportPaths(); // Exporte les chemins de dessin
      const detectionZone = {
        drawingData,
      };

      console.log("Sending captured_image:", capturedImage); // Vérifie ici que capturedImage n'est pas null
      const response = await fetch(`http://127.0.0.1:8000/cameras/${cameraId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adresse_ip: cameraDetails?.adresse_ip,
          localisation: cameraDetails?.localisation,
          statut: cameraDetails?.statut,
          modele: cameraDetails?.modele,
          fabricant: cameraDetails?.fabricant,
          zones_detection: detectionZone, // Envoi des zones de détection
          captured_image: capturedImage, // Envoi de l'image capturée en Base64
        }),
      });

      if (response.ok) {
        console.log("Dessin et image sauvegardés avec succès !");
      } else {
        console.error("Erreur lors de la sauvegarde", response.status);
      }
    } catch (error) {
      console.error("Erreur lors de l'exportation ou de l'envoi du dessin", error);
    }
  };

  if (!cameraDetails) {
    return <Typography>Chargement des détails de la caméra...</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 4, mt: 2 }}>
      {/* Card pour le flux vidéo */}
      <Card sx={{ flex: 8, height: '75vh', overflow: 'hidden', borderRadius: '16px', position: 'relative' }}>
        <CardContent sx={{ position: 'relative', height: '100%', p: 0, '&:last-child': { paddingBottom: 0 } }}>
          <Typography variant="h5" sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10, color: 'white' }}>
            {cameraDetails?.localisation} - <span style={{ color: 'red' }}>● {isImageCaptured ? 'Image Capturée' : 'Live'}</span>
          </Typography>
          <Typography variant="caption" sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, color: 'white', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', p: '2px 6px' }}>
            {time}
          </Typography>
          <Alarm size="32" color={motionDetected ? 'red' : 'grey'} style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 10, animation: motionDetected ? 'blink 1s linear infinite' : 'none' }} />
          {!isImageCaptured ? (
            <img ref={imgRef} alt="Live Camera Feed" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '16px' }} />
          ) : (
            <Box sx={{ position: 'relative', width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
              <ReactSketchCanvas
                ref={sketchCanvasRef}
                style={{ width: '100%', height: '100%', position: 'absolute' }}
                backgroundImage={capturedImage || ''}
                preserveBackgroundImageAspectRatio="xMidYMid meet"
                strokeWidth={4}
                strokeColor="red"
              />
            </Box>
          )}
        </CardContent>

        {/* Position du bouton Capture */}
        <Box sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 11 }}>
          <Button variant="contained" onClick={handleCaptureImage} sx={{ mt: 2 }}>
            Capturer l'image
          </Button>
          {isImageCaptured && (
            <>
              <Button variant="contained" color="secondary" onClick={handleResetToLive} sx={{ mt: 2, ml: 2 }}>
                Retour au flux vidéo
              </Button>
              <Button variant="contained" color="primary" onClick={handleSaveDrawing} sx={{ mt: 2, ml: 2 }}>
                Enregistrer le dessin
              </Button>
            </>
          )}
        </Box>
      </Card>

      {/* Card pour la sélection de la plage horaire */}
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
            <Button variant="contained" color="primary" onClick={() => console.log("Configuration enregistrée")}>
              Enregistrer la configuration
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ConfigCamera;
