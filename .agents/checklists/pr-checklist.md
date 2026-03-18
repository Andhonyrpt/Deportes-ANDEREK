# Pull Request Checklist

Revisión en frío antes o dutante el Merge. El PR es un gatekeeper que debe contestar a esto:

- [ ] **Specs**: El PR cierra explícitamente el spec funcional originario (`docs/specs/...md`).
- [ ] **Funcionalidad (QA)**: ¿Aparece la captura/evidencia o el OK del QA Test Designer demostrando que los CAs se cumplieron?
- [ ] **Alucinaciones**: ¿Se ejecutó el chequeo Anti-Hallucination para evitar imports fantasmas y endpoints imaginarios?
- [ ] **Seguridad (STRIDE)**: ¿Si la feature tocaba "Autenticación" o "Autorización", el Security Reviewer aprobó los mitigantes?
- [ ] **Deuda Técnica**: Si hubo atajos tomados (ej: "Se copió componente por premura temporal"), ¿se generó el Issue asociado y se referenció en el Spec al cerrar?
- [ ] **Pipeline CI**: ¿Las acciones de GitHub/GitLab pasaron la suite principal completa?
- [ ] **Memoria**: En caso de afectar despliegues o contratos grandes, ¿el Docs Keeper formuló el respectivo ADR?
