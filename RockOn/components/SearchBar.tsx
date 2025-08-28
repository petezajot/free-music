    import * as React from 'react';
    import { Keyboard } from 'react-native';
    import { Appbar, Searchbar } from 'react-native-paper';
    import { useAlbumsViewModel } from '../viewModel/AlbumsViewModel';

    export default function CustomHeader({ onSearch }: { onSearch: (query: string) => void }) {
    const [query, setQuery] = React.useState('');

    return (
        <Appbar.Header>
        <Searchbar
            placeholder="Buscar..."
            value={query}
            onChangeText={setQuery}
            style={{ width: '80%' }}
            icon="magnify"
            onIconPress={() => {
                console.log('Buscar (Icon):', query)
                onSearch(query);
            }}
            onSubmitEditing={() => {
                console.log('Buscar (Submit):', query);
                onSearch(query);
            }}
            returnKeyType='search'
        />
        <Appbar.Action icon="magnify" onPress={() => {
            console.log('Buscar (External button): ', query)
            onSearch(query);
            Keyboard.dismiss();
            }} />
        </Appbar.Header>
    );
    }
