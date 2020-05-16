import React, { useState } from 'react';
import styled from 'styled-components';
import IconSearch from '../../assets/images/icon_search.svg';
import IconNewChat from '../../assets/images/icon_new_chat.svg';
import IconButton from './IconButton';
import color from '../../assets/javascripts/color';

const Wrapper = styled.div`
  width: 309px;
  height: 69px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background: ${color.GREY_900};
`;

const SearchInputWrapper = styled.div`
  width: 217px;
  height: 41px;
  position: relative;
  background: ${color.GREY_800};
  border-radius: 5px;
  margin-left: 24px;
  margin-right: 24px;
`;

const SearchInput = styled.input`
  width: 161px;
  height: 41px;
  padding-left: 16px;
  border: none;
  background: none;
`

const Icon = styled.img`
  position: absolute;
  width: 18px;
  height: 18px;
  left: 182px;
  top: 11px;
`

interface SearchProps {
  onChange?: (text: string) => any
  onSearch?: (text: string) => any
}

const Search: React.FC<SearchProps> = ({ onChange, onSearch }) => {
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
        }} />
        <Icon src={IconSearch}/>
      </SearchInputWrapper>
      <IconButton background={IconNewChat} style={{ width: '28px', height: '28px' }}/>
    </Wrapper>
  );
};

export default Search;
