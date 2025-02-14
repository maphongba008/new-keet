/* eslint-disable react-native/no-inline-styles */

import createClient from '@holepunchto/keet-backend-rpc/client';
import * as FileSystem from 'expo-file-system';
import React from 'react';
import {Alert, Text, TouchableOpacity, View} from 'react-native';
import {Worklet} from 'react-native-bare-kit';
import RPC from 'tiny-buffer-rpc';

const documentDirectory = FileSystem.documentDirectory!;
console.log({documentDirectory});
const storagePath = documentDirectory.replace('file://', '');

const source = require('../main.bundle');

let _backend = null;

export const getKeetBackend = () => {
  return {
    api: _backend,
  };
};

export async function loadWorklet() {
  const worklet = new Worklet();
  await worklet.start('keet:/main.bundle', source, [storagePath, 'keet']);
  const rpc = new RPC(data => worklet.IPC.write(data));
  worklet.IPC.on('data', data => rpc.recv(data));

  const client = createClient(rpc);
  _backend = client;
  console.log('worklet started');
  // client.core.subscribeRecentRooms().on('data', async (rooms) => {
  //   const stats = await client.core.getStats()
  //   console.log('stats', stats)
  // })
}

const Button = ({text, onPress}: any) => {
  return (
    <TouchableOpacity
      style={{
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: 'blue',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
      }}
      onPress={onPress}>
      <Text style={{color: '#FFF'}}>{text}</Text>
    </TouchableOpacity>
  );
};

const TestApp = () => {
  const [allRoomIds, setAllRoomsId] = React.useState<string[]>([]);

  const subscribeAllRooms = async () => {
    console.log('sub all rooms');
    const backendApi = getKeetBackend();
    const sub = backendApi.api.core.subscribeRecentRooms({});
    sub.on('data', res => {
      setAllRoomsId(res.map(item => item.roomId));
    });
  };

  React.useEffect(() => {
    loadWorklet();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: 30,
        paddingHorizontal: 16,
      }}>
      <Text>{`Room count: ${allRoomIds.length}`}</Text>
      <Button
        onPress={async () => {
          console.log('get stats');
          const backendApi = getKeetBackend();
          const stats = await backendApi.api.core.getStats();
          console.log('stats is', stats);
        }}
        text="Get stats"
      />
      <Button
        text="Create room"
        onPress={() => {
          createTestRoom();
        }}
      />

      <Button
        text="Get network"
        onPress={async () => {
          console.log('get network');
          const network = await _backend.network.query();
          console.log('network is', network);
        }}
      />

      <Button
        text="Get identity"
        onPress={() => {
          getIdentity();
        }}
      />
      <Button
        onPress={async () => {
          const backendApi = getKeetBackend();
          const allRooms = await backendApi.api.core.getRecentRooms({});
          console.log('get all rooms length', allRooms.length);
          setAllRoomsId(allRooms.map(item => item.roomId));
        }}
        text="Get all rooms"
      />
      <Button
        text="Subscribe all rooms"
        onPress={() => {
          subscribeAllRooms();
        }}
      />
    </View>
  );
};

const createTestRoom = async () => {
  try {
    const backendApi = getKeetBackend();
    // const response = await backendApi.api.core.getRecentRooms({})
    // console.log('response', response)
    const title = 'MyRoom' + Math.round(Math.random() * 100);
    const r2 = await backendApi.api.core.createRoom({
      config: {
        title,
        description: 'Room description',
        roomType: '0',
        canCall: 'true',
      },
    });
    console.log('room created', {r2, title});
  } catch (e) {
    console.log(e);
  }
};

const getIdentity = async () => {
  const backendApi = getKeetBackend();
  try {
    const identity = await backendApi.api.core.getIdentity();
    console.log('identity', identity);
  } catch (e) {
    console.log('identity error', e);
  }
};

export default TestApp;
