!macro customInstall
  DetailPrint "Registering context menu..."
  
  ; Directory context menu (Right click on a folder)
  WriteRegStr HKCU "Software\Classes\Directory\shell\LiveServerHere" "" "Live Server Here"
  WriteRegStr HKCU "Software\Classes\Directory\shell\LiveServerHere" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCU "Software\Classes\Directory\shell\LiveServerHere\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
  
  ; Directory background context menu (Right click inside a folder)
  WriteRegStr HKCU "Software\Classes\Directory\Background\shell\LiveServerHere" "" "Live Server Here"
  WriteRegStr HKCU "Software\Classes\Directory\Background\shell\LiveServerHere" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCU "Software\Classes\Directory\Background\shell\LiveServerHere\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%V"'
!macroend

!macro customUninstall
  DetailPrint "Unregistering context menu..."
  DeleteRegKey HKCU "Software\Classes\Directory\shell\LiveServerHere"
  DeleteRegKey HKCU "Software\Classes\Directory\Background\shell\LiveServerHere"
!macroend
