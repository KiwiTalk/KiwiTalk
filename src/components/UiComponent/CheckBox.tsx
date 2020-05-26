import React, { HTMLAttributes } from 'react';

import styled from 'styled-components';

import RoundCheckBox from '../../assets/images/round_checkbox.svg'
import ThemeColor from '../../assets/colors/theme';

const CheckBoxContainer = styled.div`
    display: flex;
    flex-direction: row;
    position: relative;
    cursor: pointer;
    font-size: 22px;
    user-select: none;
`;

const CheckBoxUnchecked = styled.div`
    padding-left: 16px;
    padding-top: 16px;
    border-radius: 2px;
    border: 1px ${ThemeColor.GREY_100} solid;
    margin-right: 6px;
`;

const CheckBoxChecked = styled.img`
    width: 18px;
    height: 18px;
    margin-right: 6px;
`;

const CheckBoxLabel = styled.span`
    font-family: NanumBarunGothic;
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 18px;
    color: ${ThemeColor.GREY_100};
`;

interface CheckBoxProps extends HTMLAttributes<HTMLDivElement> {
    label: string
    checked: boolean
}

export const CheckBox: React.FC<CheckBoxProps> = ({ label, checked, ...args }) => {
    return (
        <CheckBoxContainer {...args}>
            {checked ? <CheckBoxChecked src={RoundCheckBox} /> : <CheckBoxUnchecked />}
            <CheckBoxLabel>{label}</CheckBoxLabel>
        </CheckBoxContainer>
    );
};

export default CheckBox;
