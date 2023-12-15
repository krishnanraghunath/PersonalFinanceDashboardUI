// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. // SPDX-License-Identifier: MIT-0
import React from "react";
import { createRoot } from 'react-dom/client';
import { createTheme,ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from "./App";
const container = document.getElementById('root');
const root = createRoot(container);

const theme = createTheme({      
  typography: {
    button: {
      textTransform: 'none' //No more uppercase button texts
    }
  }
});

root.render( <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>)