'use client';

import { useEffect, useState } from 'react';
import {
  Grid,
  TextField,
  Button,
  MenuItem, // Add for the client dropdown
  Card,
  CardContent,
  Switch,
  FormControlLabel,
} from '@mui/material';
import Swal from 'sweetalert2';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';

interface Client {
  id: number;
  nom_entreprise: string;
}

export default function CreateCameraPage() {
  const router = useRouter();
  const [formErrors, setFormErrors] = useState<any>({});
  const [clients, setClients] = useState<Client[]>([]); // To store the list of clients

  // State for form data
  const [formData, setFormData] = useState({
    client_id: '',
    adresse_ip: '',
    localisation: '',
    statut: 'active',
    modele: '',
    fabricant: '',
    zones_detection: {},
  });

  const theme = useTheme();

  // Fetch clients from FastAPI
  const fetchClients = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/clients'); // Adjust this endpoint based on your API
      const data = await response.json();
      setClients(data); // Set the clients in the state
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    fetchClients(); // Fetch the clients when the component mounts
  }, []);

  // Handle form data change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manual validation
  const validateForm = () => {
    const errors: any = {};

    if (!formData.client_id) errors.client_id = 'Client requis';
    if (!formData.adresse_ip) errors.adresse_ip = 'Adresse IP requise';
    if (!formData.localisation) errors.localisation = 'Localisation requise';
    if (!formData.modele) errors.modele = 'Modèle requis';
    if (!formData.fabricant) errors.fabricant = 'Fabricant requis';

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez corriger les erreurs dans le formulaire',
        background: theme.palette.mode === 'dark' ? '#333' : '#fff',
        color: theme.palette.mode === 'dark' ? '#fff' : '#000',
        confirmButtonColor: theme.palette.primary.main,
      });
      return;
    }

    const cameraPayload = {
      client_id: formData.client_id, // Set this based on the selected client
      adresse_ip: formData.adresse_ip,
      localisation: formData.localisation,
      statut: formData.statut,
      modele: formData.modele,
      fabricant: formData.fabricant,
      zones_detection: formData.zones_detection,
    };

    try {
      // POST request to create a camera
      const cameraResponse = await fetch('http://127.0.0.1:8000/cameras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cameraPayload),
      });

      if (!cameraResponse.ok) {
        throw new Error("Erreur lors de la création de la caméra");
      }

      const createdCamera = await cameraResponse.json();
      console.log('Caméra créée:', createdCamera);

      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Caméra créée avec succès',
        background: theme.palette.mode === 'dark' ? '#333' : '#fff',
        color: theme.palette.mode === 'dark' ? '#fff' : '#000',
        confirmButtonColor: theme.palette.primary.main,
      }).then(() => {
        router.push('/camera/list'); // Redirect to camera list page after success
      });
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Une erreur est survenue lors de la création de la caméra",
        background: theme.palette.mode === 'dark' ? '#333' : '#fff',
        color: theme.palette.mode === 'dark' ? '#fff' : '#000',
        confirmButtonColor: theme.palette.primary.main,
      });
    }
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>

            {/* Client selection */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Client"
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                error={!!formErrors.client_id}
                helperText={formErrors.client_id}
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.nom_entreprise}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Adresse IP"
                name="adresse_ip"
                value={formData.adresse_ip}
                onChange={handleChange}
                error={!!formErrors.adresse_ip}
                helperText={formErrors.adresse_ip}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Localisation"
                name="localisation"
                value={formData.localisation}
                onChange={handleChange}
                error={!!formErrors.localisation}
                helperText={formErrors.localisation}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Modèle de la caméra"
                name="modele"
                value={formData.modele}
                onChange={handleChange}
                error={!!formErrors.modele}
                helperText={formErrors.modele}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fabricant"
                name="fabricant"
                value={formData.fabricant}
                onChange={handleChange}
                error={!!formErrors.fabricant}
                helperText={formErrors.fabricant}
              />
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Soumettre
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}
