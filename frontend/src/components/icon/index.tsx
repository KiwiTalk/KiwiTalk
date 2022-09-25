import styled from 'styled-components';

const Base = styled.span`
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;

  user-select: none;

  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;

  -moz-osx-font-smoothing: grayscale;

  font-feature-settings: 'liga';
`;

export const MaterialIconRound = styled(Base)`
  font-family: 'Material Icons Round';
`;
