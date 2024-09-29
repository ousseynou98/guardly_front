import CameraDetails from 'views/camera/DetailCameraPage';

// ==============================|| USERS - DETAILS ||============================== //

type Props = {
    params: {
      id: string;
    };
  };
  
  export default function Page({ params }: Props) {
    const { id } = params;
  
    return <CameraDetails cameraId={id} />;
  }