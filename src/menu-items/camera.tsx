// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Story, Fatrows, PresentionChart } from 'iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  cameras: Story,
  statistics: Story,
  data: Fatrows,
  chart: PresentionChart
};

// ==============================|| MENU ITEMS - cameraS ||============================== //

const camera: NavItemType = {
  id: 'group-camera',
  title: <FormattedMessage id="Gestion Cameras" />,
  icon: icons.cameras,
  type: 'group',
  children: [
    {
      id: 'List',
      title: <FormattedMessage id="Cameras" />,
      type: 'item',
      url: '/camera/list',
      icon: icons.statistics
    },
    
  ]
};

export default camera;
