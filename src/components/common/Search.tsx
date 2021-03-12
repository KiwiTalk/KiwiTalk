import React, { useState } from 'react';
import styled from 'styled-components';
import { IconButton } from '@material-ui/core';
import color from '../../assets/colors/theme';

import IconSearch from '../../assets/images/icon_search.svg';
import IconNewChat from '../../assets/images/icon_new_chat.svg';

const Wrapper = styled.div`
  height: 52px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background: ${color.GREY_900};
  
  padding: 0 12px;
`;

const SearchInputWrapper = styled.div`
  height: 32px;
  position: relative;
  background: ${color.GREY_800};
  border-radius: 6px;
  margin-right: 4px;
  
  display: flex;
  
  flex: 1;
`;

const SearchInput = styled.input`
  height: 28px;
  padding: 4px;
  outline: none;
  border: none;
  background: none;
  
  flex: 1;
`;

const Icon = styled.img`
  width: 16px;
  height: 16px;
  -webkit-user-drag: none;
`;

interface SearchProps {
    onChange?: (text: string) => any
    onSearch?: (text: string) => any
}

const Search: React.FC<SearchProps> = ({onChange, onSearch}) => {
  const [search, setSearch] = useState('');
  return (
    <Wrapper>
      <SearchInputWrapper>
        <SearchInput value={search} onChange={(e) => {
          setSearch(e.target.value);
          if (onChange) onChange(search);
        }} onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (onSearch) onSearch(search);
          }
        }}/>
        <IconButton style={{ width: '32px', height: '32px' }}>
          <Icon src={IconSearch}/>
        </IconButton>
      </SearchInputWrapper>
      <IconButton>
        <Icon src={IconNewChat} />
      </IconButton>
    </Wrapper>
  );
};

export default Search;
