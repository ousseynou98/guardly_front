import EditCamera from 'views/camera/EditCameraPage';

// ==============================|| USERS - EDIT ||============================== //

type Props = {
  params: {
    id: string;
  };
};

export default function Page({ params }: Props) {
  const { id } = params;

  return <EditCamera cameraId={id} />;
}
