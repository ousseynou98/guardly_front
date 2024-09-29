// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Story, Fatrows, PresentionChart } from 'iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  users: Story,
  statistics: Story,
  data: Fatrows,
  chart: PresentionChart
};

// ==============================|| MENU ITEMS - userS ||============================== //

const user: NavItemType = {
  id: 'group-user',
  title: <FormattedMessage id="Gestion Utilisateurs" />,
  icon: icons.users,
  type: 'group',
  children: [
    {
      id: 'List',
      title: <FormattedMessage id="Utilisateurs" />,
      type: 'item',
      url: '/user/list',
      icon: icons.statistics
    },
    
  ]
};

export default user;
