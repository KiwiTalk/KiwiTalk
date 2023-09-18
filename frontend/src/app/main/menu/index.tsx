import { SideMenu } from '../../../components/side-menu';
import { styled } from '../../../utils';
import { appSideMenu, sideButton } from './index.css';

export const AppSideMenu = styled(SideMenu, appSideMenu);
export const SideButton = styled('button', sideButton);
