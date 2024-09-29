'use client';

import { useState, useEffect, MouseEvent, ChangeEvent } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Typography,
  Stack,
  Button,
  Box,
  Paper,
  TablePagination,
  TextField,
  Button as MUIButton // Import Button for the online status indicator
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Eye, Edit, Trash, Setting2, Video } from 'iconsax-react'; // Import icons for live, configure
import { useRouter } from 'next/navigation';

interface Client {
  nom_entreprise: string;
}

interface Camera {
  id: number;
  adresse_ip: string;
  localisation: string;
  statut: string;
  modele: string;
  client: Client;  // Add client information
  en_ligne: boolean; // Add online status
}

export default function CameraPage() {
  const theme = useTheme();
  const router = useRouter();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [filteredCameras, setFilteredCameras] = useState<Camera[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch cameras from the API endpoint
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/cameras');
        const data = await response.json();
        setCameras(data);
        setFilteredCameras(data);
      } catch (error) {
        console.error('Error fetching cameras:', error);
      }
    };
    fetchCameras();
  }, []);

  // Handle page change
  const handleChangePage = (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search input change
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = cameras.filter((camera) =>
      camera.localisation.toLowerCase().includes(term) || camera.adresse_ip.toLowerCase().includes(term)
    );
    setFilteredCameras(filtered);
    setPage(0);
  };

  // Handlers for actions
  const handleViewLive = (cameraId: number) => {
    router.push(`/camera/live/${cameraId}`); // Navigate to the live view page
  };

  const handleEdit = (cameraId: number) => {
    router.push(`/camera/edit/${cameraId}`); // Navigate to the edit page
  };

  const handleDelete = (cameraId: number) => {
    console.log('Delete camera:', cameraId);
    // Here you can add logic to delete the camera
  };

  const handleConfigure = (cameraId: number) => {
    router.push(`/camera/config/${cameraId}`); // Navigate to the configuration page
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredCameras.length) : 0;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Liste des caméras</Typography>
        <Button variant="contained" onClick={() => router.push('/camera/create')}>
          Ajouter une caméra
        </Button>
      </Box>

      <Box p={2} display="flex" justifyContent="flex-start">
        <TextField
          label="Rechercher des caméras"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: 300 }}
        />
      </Box>

      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="camera table">
          <TableHead>
            <TableRow>
              <TableCell>Adresse IP</TableCell>
              <TableCell>Localisation</TableCell>
              <TableCell>Client</TableCell> {/* New Client Column */}
              <TableCell>Statut</TableCell>
              <TableCell>Modèle</TableCell>
              <TableCell>En Ligne</TableCell> {/* New Online Status Column */}
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCameras.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((camera) => (
              <TableRow key={camera.id}>
                <TableCell>{camera.adresse_ip}</TableCell>
                <TableCell>{camera.localisation}</TableCell>
                <TableCell>{camera.client.nom_entreprise}</TableCell> {/* Display client name */}
                <TableCell>{camera.statut}</TableCell>
                <TableCell>{camera.modele}</TableCell>
                <TableCell>
                  <MUIButton
                    variant="contained"
                    color="success"
                    size="small"
                    disabled={!camera.en_ligne} // Disable if camera is offline
                  >
                    {camera.en_ligne ? "En ligne" : "Hors ligne"} {/* Text based on status */}
                  </MUIButton>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Voir live">
                      <IconButton color="primary" onClick={() => handleViewLive(camera.id)}>
                        <Video />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Configurer">
                      <IconButton color="secondary" onClick={() => handleConfigure(camera.id)}>
                        <Setting2 />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton color="warning" onClick={() => handleEdit(camera.id)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton color="error" onClick={() => handleDelete(camera.id)}>
                        <Trash />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={7} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredCameras.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
