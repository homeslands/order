// import React from 'react';
import { FacebookProvider, CustomChat } from 'react-facebook';

export default function MessengerChat() {
  return (
    <FacebookProvider appId="496787993494063" chatSupport>
      <CustomChat pageId="565206383336775" minimized={true} />
    </FacebookProvider>
  );
}
