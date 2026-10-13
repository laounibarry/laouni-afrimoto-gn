// ════════════════════════════════════════════════════════════════════════════
//  /api/send-email — LA SEULE PORTE DE SORTIE DES COURRIELS
//
//  Tout passe ici : les courriers de validation envoyés par la base, les
//  récupérations de compte du site, et le « Nous écrire » de l'application.
//
//  ══ 11/10/2026 — LE SECOURS EMAILJS, CÔTÉ SERVEUR AUSSI ══
//
//  Depuis des semaines, Resend refusait tout : « 401 API key is invalid »
//  (prouvé en lisant net._http_response, fichier SQL 114). Le SITE, lui,
//  retombait sur EmailJS dans le navigateur et ses mails partaient — mais les
//  courriers de VALIDATION partent de la base, arrivent ici, et ici il n'y
//  avait pas de secours : Resend ou rien. Résultat : « le mail ne part pas
//  quand la validation », signalé trois fois.
//
//  Décision du fondateur, le 11/10 : les validations doivent partir par le
//  canal qui marche. Désormais :
//
//    1. RESEND D'ABORD — meilleur expéditeur (noreply@laouni-securite-ultime.com,
//       notre domaine), 3 000 courriels/mois. Le jour où sa clé est réparée,
//       il reprend la main sans qu'on touche à rien.
//    2. EMAILJS EN SECOURS — le même compte que le site, le même modèle.
//       Prouvé le 11/10 : un essai réel envoyé d'ici même est arrivé dans sa
//       boîte. ⚠️ 200 courriels/mois seulement, et l'expéditeur est le Gmail
//       du compte : c'est une béquille, pas une maison.
//
//  La réponse dit TOUJOURS par où le courriel est parti (« via »), pour que
//  net._http_response raconte la vérité — on a assez souffert d'un journal
//  qui disait « parti » sans savoir.
//
//  ⚠️ Les identifiants EmailJS ci-dessous sont les mêmes que ceux écrits dans
//  la page du site : ils sont déjà publics par nature (clé « publique »).
//  Rien de secret ne s'ajoute ici.
// ════════════════════════════════════════════════════════════════════════════

const EMAILJS = {
  serviceId: 'service_0rvox9x',
  templateId: 'template_6uq04fr', // variables : to_email, titre, contenu
  publicKey: 'awxu35zCxrmJzkyOZ',
  // EmailJS n'accepte que les appels « de navigateur » : il vérifie l'origine.
  // On se présente comme le site — c'est le nôtre.
  origine: 'https://www.laouni-securite-ultime.com',
};

// ══ 13/10/2026 — L'ATTESTATION, FABRIQUÉE ICI MÊME ══
//
// Décision du fondateur : « le mail de validation doit tout contenir sauf le
// QR code et doit partir direct avec le PDF dans le même mail, dès
// validation ». La base ne sait pas fabriquer un PDF : elle envoie les CHAMPS
// (champ « attestation » : { titre, sous_titre?, lignes: [[libelle, valeur]…],
// pied?, fichier? }), et c'est cette fonction qui dessine le document — une
// page A4, l'en-tête AfriMoto, les champs, le pied. Aucune bibliothèque :
// le PDF est écrit à la main, offsets exacts, lisible par tout lecteur.
//
// ⚠️ Le QR et le code d'accès ne figurent JAMAIS ici : celui qui appelle ne
// les envoie pas, et ce dessinateur ne saurait pas les dessiner.
//
// Le filigrane : le logo de L APPLI (AfriMoto-Play/icone-512.png — choisi par le
// fondateur le 13/10 contre celui du site), réduit, légèrement
// flouté, posé au PLEIN CENTRE à 10 % d'opacité — on le voit, il ne gêne
// jamais la lecture. Fabriqué une fois pour toutes (JPEG, 6 Ko) et embarqué
// ici même : la fonction ne dépend d'aucun fichier au moment d'envoyer.
const LOGO_FILIGRANE_B64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAwICQsJCAwLCgsODQwOEh4UEhEREiUbHBYeLCcuLisnKyoxN0Y7MTRCNCorPVM+QkhKTk9OLztWXFVMW0ZNTksBDQ4OEhASJBQUJEsyKzJLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS//AABEIASwBLAMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AOjUYrwEj32LTEFABQAZpXGNLUrhYTNK47BmgYlABQAUAFABQAUAFABQAUAFABQAUAIeRSYIjPFQWJmkMM0AGaADNABmgAzQAZoAM0ALmncVhQ1O4WFDU7isLmmIKACgAoAKAJa0MwoAM0DELVLY7Dc0hiUgCgAoAKACgAoAKACgAoAKACgAoAKACgAoAKAGsKTRSI6goKBhQAUAFABQAUAFABQAUAGaBChqdxWHA1VxWFpiCgAoAlrQgM0ANJqWxpCVJQUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFACGgCNhg1DLQ2kMKACgAoAKACgAoAKACgAoAKAFBouKw4GrTJaFzTEGaAJc1oQITUtjSG1JQUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAMcVLKRHUlhQAUAFABQAUAFABQAUAFABQAUAKDQmJodmtEQLmgRJmrZCEzUFhQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABmgBM0AGaAFoAKAEbpSY0QnrUGgUgCgAoAKACgAoAKACgAoAKACgAoAUGrTJaFqiSUmqZKEqCgoAKACgAoAKACgAoAKACgAoAKACmAmaADNABmgAGT0FOwrokWCRhkKapU2yHOKGMjr1BpOLRSkmNzUlC5oAM0gIm61DLQlIYUAFABQAUAFABQAUAFABQAUAFAAKaBjs1oQSUMlBSGFABQAUAFABQAUAFABQAZoAM0AGaYCZoAAGboKaTYm0ieO0lk6Ka0jSkzOVWKL0GkO33q6IYZvc5p4pLY0IdKjTlsV1Rw8VucssRJ7FoQwIMcVryQRk5zZHJZQyjjFS6UZFRqyiUZ9GB5WueeF7HRDFdzPm02WPoK5pYeSOqOIiyo8Tp1BrBwaN1NMgfg81k0aobmpGLmgAzQMKACgAoAKACgAoAKACgAoAKAFzVpkWJqZIlAwoAKACgAoAKACgAzQAZoATNMBVVm6CmotkuSRYisZZOxrWNGTMpVoovwaOxwWrphhe5zTxXY0IdMijHzYrpjQijlliJMsfuIR2rT3YmfvSIJdSjT7uKl1ki40WyjNqjN92sJV2bxoIqPeSMc5rJ1GaqmkSRahInU1UarRMqKZeh1UHhq2jXMJUOxcS7hlHOK2U4yMXCUQe1gmHGKTpxkNVJRKFzoqvkrXPPCp7HTDFNbmXPpEsecCuOeGkjrhiospSW8kZ5U1zunJHTGpFkXI61Fi7hmkMXNABQAtABQAUAFABQAUAFABRcRNWhAUAFABQAUAFABQAmaABQWOBTSuJuxah0+WTsa3jQkzCVeKNG30bu1dMML3OWeK7F+LT4YhziumNGMTmlXlIlMkEI4xV3jEi0pFebU0XhaiVZLY0jQb3KE2pu3Q1hKs2bxoJFR7mR+pNYubZsoJERJPU1Ny7BipuOwYouAYouAYp3FYcruvQmqUmhOKZYivpE7mtFVaMpUky5Dq2OGrWNcxlh+xdjv4ZR82K2VWMjF0pRHNBbzjtTcISEpziU7jRY3yVrCeFT2OiGKa3My40aRM7RXJPCtbHXDFJ7mfNbSQn5ga5ZU3Hc6o1FLYiBrM0FoGFABQAUAFABQAUAFIRNWhAUAFABQAUAFABQAhpiLukoJJhmunDxvI5sRJqJ0x8uCMHAr1tIo8jWTKM2qKuQtYyrpG8aDe5Rm1J36GsJVmzeNFIqPO79TWLm2bKCQzJPU1NyrBilcYUrjFoAKQBQBLDA0rYAq4xciJSUTTg0vIy1dcaHc5J4jsTNpS4rT2CM/rDKN1prJkgVhOi0bwrJmZKpVsGuWWh1x1Gq7L0NCk0DimWIr2WPua0jVaM5Uky9Bq5H3q3jiO5hLDmjbX0dxxxXTGopHNOk4kGswJ5BYCssTBctzXDTfNY5JuHIrxXue2thakYtABQAUAFABQAUAFAE9aGYUAFABQAUAFACUANY0wNDRT+/FdeG+I48T8Jvakf8AR/wr0avwnnUviOcbljXnM9JISpuMWlcYUXAKQxaACgAoAdGu9wKcVdik7I6HT7VY0BI5r06VNJHmVqjbLM06QDLECtZTUdzKMHLYrpqcLtjcKyWIi3Y1eHklctfLKvqDW2kkYaxZhatabCWArgr07anoYepfQyCK4jtEouFgp3FYv6ST5w5rpoPU5q60NbWP+PX8K6sR8ByYf4zjmPzmvDlue7HYUVJQtAwoAKACgAoAKAFoETVoQFABQAUAFABQAUAMamIv6L/x8CuvDfEceJ+E39T/AOPf8K9Cr8J51H4jnT9415rPTQVJQUAFAwoAKAFoAKALWnrumFbUVeRhWdonSoNsf4V6i0R5T1Zy2v3TiQqDgV5GLqO9j2cHSVrmNHO6uCGNcCm0z0JQTR2GiTtLCN1e5hZuUTwcVBRloWNTQNCa1rK8TGg7SOVkGHIryHuewthtIoKYi9pP+vFdNDc5a/wmvrH/AB6fhXXiPgOPD/Gca33zXhy3PejsKKkoWgAoAKACgAoAKAFpATVqZhQAUAFABQAUAFADWpgX9E/4+BXXhviOLE/Cb+p/8e/4V6FX4TzqPxHOH7xrzWeohakoKACgAoAKACgAoAtae+2YVtSdpGNZXidNGd0Y+leotUeS9GYWtaa0xLIK8/E0HLVHpYXEKOjMaHSpmkAKnFcEcNJs75YmKR1emWv2eIA9a9mhT5Ini16nPINTkCwmnXdoioK8jlpDlya8dvU9hLQbSGJTEX9J/wBeK6aG5zV/hNfWf+PT8K7MR8Bx4f4zjG++frXhy3PdjsOFSULSAKACgAoAKACgAoAnrUgSgAoAKACgAoAKAGtQI0NE/wCPgV2Yb4jjxPwm/qf/AB7/AIV6Fb4TzaPxHOH7xrzGeogpFBSGFABQAUAFABQA+J9jg1UXZkyV0dJp04kjAzzXqUZ3R5NaFmXCobqK2tcxvYaIkByFFLlQ+ZjjhRT2FuYGs3WTtBrz8TU6Ho4an1MauA9ASgApiL2k/wCvFdNDc5a/wmvrP/Hp+FdmI+A48P8AGcY33z9a8OW570dhwqChaACgAoAKACgAoAKAJ60MwoAKACgAoAKACgBjUwNDRP8Aj4FdeG+I4sT8J0Gp/wDHv+FejW+E82j8Rzh+8a8xnqoSpGLQMKACgAoAKACgAoAvaddGJwCeK6KNTlZzVqfMjooZBIoINenGV0eXKNmSVRJR1G7EMZGeawrVOVHRRp8zOYnlMrkmvJnLmZ68I8qIqgsKAEoEX9J/14+tdVD4jlxHwmvrP/Hp+FdmI+A48P8AGcY33z9a8KW570dhRUlC0AFABQAUAFABQAtAEitmrTIaHUxBQAUAFABQAUANamBoaJ/x8CuvDfEcWK+E6DU/+Pf8K9Gt8J51H4jmz9415jPUQVIwoGFABQAUAFABQAUAKCQcimI09N1DYwRzXZRq20Zx16N9Ubqyqy5zXdzKx5/K7mDrqk/MDxXFiVc9DCu2hiqcivOPRFoEFABQIv6T/rxXVQ+I5sR8Jr6z/wAen4V2Yj4Diw/xnFt98/WvClue9HYcKksKACgAoAKACgAoAWgADYNCYmiVWzVpkNDqYgoAKACgBKAGtTA0NE/4+BXXhviOLFfCdDqf/Hv+FejW+E86j8RzZ+8a8xnqISpKFoAKACgAoAKACgAoAQmgCMuVcEUk9RtXR0NmXntRg816ULyieZO0ZjNSiK2p3daVSLUdSqUk56HPL1NeYz0xaQBTAKAL+k/68V1UPiOXEfCbGtf8en4V2Yj4Diw/xnFN9814Utz347DhUlC0gCgAoAKACgAoAKAEoAcrYppg0SK2au5DQ6mIKACgBKAGtQI0dD/4+BXZhviOPFfCdDqf/Hv+FejW+E82j8RzTfeNeYz1EFSUFABQAUAFABQAUAITigYxmqWykhgG9wBRFXYSdkdNZOba3XIr1IPkieVUXPIj1ecNbfWlWneI6ELSOcXvXls9UdSAKACmIv6R/rxXVQ+I5cR8Jsa1/wAen4V2Yj4Diw/xnFP98/WvClue/HYUVJQtIAoAKACgAoAKACgYlABQAobFO4miRXqkyWh+aZIUAFMBrUAaOh/8fArsw3xHFivhOh1P/j3/AAr0a3wnm0fiOaP3jXmM9RCVJQUhi0AFACZoATd6U7AKEkbopqlBsnmSF+yzt/CafspMXtYoUWE7djQqMgdeJestMMbB5a6KdHl1ZzVK/NojcURPH2wK7FyyRwtyizn9ZnBfYvQVw4ifRHo4eD3ZmLwK4jsFoAKACmIv6R/rxXTQ+I5cR8Js61/x6fhXbiPgOLDfGcS33z9a8KW578dhRUFi0AFABQAUAFABQAtADaBhQAUALmgQ5XppiaHhwaq5Nh2aYhrUxGjof/HwK7MN8RxYr4TotU/49/wr0a3wnm0fiOZb7xrzGeqgqSgpAFACFsUwJra0kuG4BxWsKTkZTqqJpwafFEQJOtdUacY7nJKrKWxfa2jji3KordxSV0c6m27MW0CvncoFKnruOppsMmysoCgYpSunoONnHUnl2NFgkCrkk0ZxupGTd3y28ZRDk1zTqKCsjrhSc3dmG7mVyzV58pczPRjHlVgqSgoAKBCUwNDSP9eK6aHxHJiPhNjWv+PT8K7MR8BxYb4ziW++a8KW59BHYcKkoKBhQAUAFABQAUALQAlABQAUAFABQAZoAUOadxWAyVSZLRpaJIPtI+tdeGfvHFio+6dNqIzbZ9q9Sr8J5NH4jmHOGNeW9z1lsJuFTcuwm6lcdhrPii4WLmnWbXDbiOBXTSp82pzVqqjob1oUibYF6V2waTscE02rheNEjbmYcUVOW9wp8zVkUJtZVRtXmsZYhLQ3jhm9SqdZYfdGKy+s22Nvqt9yNtYkapeIZSwyIJdRmkGMmolXkzSNCKKxLOcsc1g5NmySWwtIYUAFABQAUxGloy5mFdeHWpyYl6GprrbbXHtXTiX7hyYVXmcUT85+teG9z347DhUlC0AFABQAUAFABQAUANzQAZoAM0AGaADNABmgAzQA1jTEWtLk2XS/Wuig7SObERvE7WUebZcele1LWB4UfdmcpcgpKRXlTVmexB3RFmszQM0hiwoZZQtXCN2TOVkdXYJHBEFPU16tO0VY8erzSdyPUJ47VSw+8amo1DUqlGU9DnLm7kuHJJOK8+dRyZ6cKSiiDHrWRqLxSAOKAFoAM0AGaADNABmgAoAKaEbehRZbNd+GiefipDvEs22LbTxctLE4ON3c5IHJrx2e2hwNSULmgAzQAZoAM0AGaADNAC5oAZmmAZoAM0AGaADNABmgAzQAhNMQsL7JVPvVwdmZzV0d1pUwuLMDPavcoy5oHgV48szD1eAxzE4rirxszvw87ozs1ynUGaBlzSE33IzXRQV2c2IdonTNa9Gz0Feg6fU8xVOhzuszFptmeBXDiJa2PRw8dLmeK5TrCgAoAKACgAoAKACgAoAM0AOQbmAqoq7Ik7I6rSYfKg3H0r1aMeWJ5FeXNKxz3iO53zFQa8/FTu7Ho4OFlcxBXAekh+aQwzQAZoAM0AGaADNABmgBc0AMzTEGaADNABmgAzQAZoAM0AITQA0mmJnSeGr7DCNjXp4Wp0PKxlLqa+sWvmxb1FdNeHMrnJh6nK7HLupRiDXmNWPVTuhtIo0dDB+0DiurD7nLifhOqwSuD6V6R5Ohh6npTO5da461FvU76NdJWMSWJomIYVwSi0ehGSkiPNIoM0AGaADNABmgAzQAUAFAgoAv6XbGaUHHFdFGF2c1epyo6K9lW0syM44r0JvkiebTi5zOEvZzNOzZ714lSXMz36UeWJCKxNh2aADNABmgAzQAZoAM0AGaAFzQMZmgQZpgGaADNABmgAzQAZoAM0ANNAE1lcG3mVge9a05crMKsOZHdadcpeWoBOTivapzU4nhVYOnIxtXsTE5ZRxXJWp2dztoVbqxkgfNiuSx2XOl0S2VI/MIr0cPCyueZiZtuwmo6x5D7V7VnWxXK7I0oYXnV2S6bqYu/laroYj2mjIr4f2eqKmu2wX5wKjEQ6l4ao3oYFcJ6IZoAM0AGaADNABmgAzQIM0ASwRGVwoFXGN2ROXKjq9NtVtodzcHFepSgoq55Nao5uyMHxHqW9jGprixNW+iO7CUbas5wHJrzmeohwpDFzQAZoAM0AGaADNABmgAzQAuaQDaYBmgAzQAZoAM0AGaADNABmgBppgNNAmbGh6mbaUKx4rsoVeV2OHE0eZXOwYR31vkYJIr1GlOJ5CbpyOZvrJreXOOM159Sm4s9OlVUkbujyB7fbnnFdlF3jY4a6tK5k6vp8rTFlBNefiKEnK6PQw1eKjZk+h2Mkb7mGK0wtFxd2Z4utGSsifX5VCbc810Yh6WOfCxd7nNZrzz0wzQAZoAM0AGaADNABmgB8aNIwAFUo3JlJI6TSNOCAO4rvo0ras82vWvog1zU1toiiHmnXqqKshYei5O7OJnmaaQsx615E5czPahHlVhoqDUdmkAuaADNABmgAzQAZoAM0AGaACgBuaYBmgAzQAZoAM0AGaADNABmgBKBCGmAgJU5FNOxLVzodC1kxMI5DxXfQr20Z52Iw99UdPLHFfQ5GCSK72lNHmxlKmzKCyafLkA7a5rOmzquqqL8eowSL8+M1sqkXuYOlJbDbjVIYkOzGaUqsYrQqNCUnqc3fXbXEhJPFcFSfMz0qdNQRUrI1CgAoAKACgBc0ASQwtKwCirjFsiUkjo9L0sIA8grupUbas86tXvoibVdTjs4SqkZxWlWqoIzo0XN3ZxF7ePdSlieK8ipNyZ7VOmoIrisjccKQC0DDNABmgAzQAZoAM0AGaADNABmgBuaYBmgAzQAZoAM0AGaADNABmgAzQAUCGmgBAxQ5Bqk7EtXN/RdcaFgkh4rto17aM8+vhubVHVo8F/FwQSa9C8Zo8xqVNmNqOlyRktHnFctSi1sdlKunozFlEinD5rkkmtzti09iLNSUGaBhmgAzQAUAKOelFhFu0sZJ2HBxWsKbkYzqqJ0lhpsdsgZ8Zrvp0lHc86pWcnZEGrazHaxlIyM1NWsoqyKo4dzd2cZe3sl1ISxOK8upUcmexTpqCK4rI2Q4Uhi5oAM0DDNABmgAzQAZoAM0AGaADNABmgBuaBBmgAzQAZoAM0AGaADNABmgAzQAZoAKYDTQAmSDkU0S0aemaxLauAWOK6aVZxOWrQU0dhYatBeRgMRmvShVjNHk1KMoPQL3So51LJilOipbDp13HRnPXemywE8HFcU6TiehCspFFlKnBFYtG6dxKACgCWGB5ThQapRbIlNI2tP0UsQ0grqp0O5x1cR2NoLb2MeTgYrqtGCOO8qjOf1jxD1SI1yVcR0R20cL1Zy89w87lmJNcEpOTPTjBR2IxWZoOFAxc0AGaQBmgAzQAZoAM0AGaADNABmgAzQAZoGNzTEGaADNABmgAzQAZoAM0AGaADNABmgAzQAUANNMBDQIlt7qS3YFWNaRm4mU6aludLpXiMjCymu6niO559bC9UdFHcW18nUZNdalGaOBxnTZSvdFSQFo6ynQT2N6eIa3MSbSpkfAU1yui0dka8Wi5ZaI7kFxWkKDe5lUxKWxtwWMFouWxxXVGnGJxSqym9CpqGuQ2ylUIzUTrqOxpTw8p7nJ6jrUt0xAY4rgqVnI9Olh1EyyxY5JzXM3c6krCikUKKBi5pAGaADNABmgAzQAZoAM0AGaADNABmgAzQAuaAGZpgGaADNABmgAzQAZoAM0AGaADNABmgAzQAZoAM0AJQAhpiEyQcigTRctNTmtmGGOK2hVcTCdGMjpNN8TAgLKa7aeJ7nn1cJ2N2LULWZdxIrpU4s5HTnHQq3uuwWykIRmonXjHY0hh5S3OY1HxDLOSEOBXFUxDZ6FPCqO5jSTPKcsxNcrk2dkYpbDBUlC0FC0gFzQAZoAM0AGaADNABmgAzQAZoAM0AGaADNABmgBc0xDc0MEJmgYZoAM0AGaADNABmgAzQAZoAM0AGaADNABmgAoAKBCUAJTCwgJB4NFybE6XkyDAY1am0Q6cWRvK8hyzE1Lk2UopDKRVhaQxaAFoGGaADNABmgAzQAZoAM0AGaADNABmgAzQAZoAM0ALmgAzTJG0AgzQUGaADNABmgAzQAZoAM0AGaADNABmgAzQAZoAM0AGaAEoEFACUAFABQAtABQAtABmgYZoAM0AGaADNABmgAzQAZoAM0AGaADNABmgAzQAUCFzTENoAQ0hhmgAzQAZoAM0AGaADNABmgAzQAZoAM0AGaADNABmgAzQAZoAM0AGaADNABmgAzQAZoAM0AGaADNABmgAzQAZoAM0AGaADNABmgAzQAZoAM0ALTEFACUwCkA00DDNABmgAzQAZoAM0AGaADNABmgAzQAZoAM0AGaADNABmgAzQAZoAM0AGaADNABmgAzQAZoAM0AGaADNABmgAzQAZoAM0AGaADNABmgBRQAtAgpgJSAKAEoGIaYCZoAM0AGaADNABmgAzQAZoAM0AGaADNABmgAzQAZoAM0AGaADNABmgAzQAZoAM0AGaADNABmgAzQAZoAM0AGaADNABmgAoAcKQC0CCgAoASgAoAKAEoGIRTASgBM0xBmgAzQAZoAM0AGaADNABmgAzQAZoAM0AGaADNABmgAzQAZoAM0AGaADNABmgAzQAZoAM0AGaADNABQMUUgHCgBaQgoAKACgBKYBQAUAFABQAhoGIaAEpgJQIKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoGLQA4UgFoAKBBQAUAFABQB//2Q==';

function pdfAttestation(att) {
  // Texte en WinAnsi (latin1) : les accents français passent, le reste est
  // retiré, et ( ) \ sont échappés — sinon le PDF se casse sur un nom.
  const t = (s) => String(s == null ? '' : s)
    .replace(/[—–]/g, '-').replace(/[’‘]/g, "'")
    .replace(/[«»“”]/g, '"')
    .replace(/[^\x20-\x7EÀ-ÿ©°]/g, '')
    .replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  let corps = '';
  const L = (x, y, taille, police, s) => {
    corps += 'BT /' + police + ' ' + taille + ' Tf ' + x + ' ' + y + ' Td (' + t(s) + ') Tj ET\n';
  };
  // Le filigrane D'ABORD : il se dessine sous tout le reste, au plein centre
  // de la page (A4 : 595×842), à 10 % d'opacité via l'état graphique GS1.
  const logo = Buffer.from(LOGO_FILIGRANE_B64, 'base64');
  corps += 'q /GS1 gs 300 0 0 300 147.5 271 cm /Im1 Do Q\n';
  // La bande orange du haut, comme les courriers.
  corps += '0.976 0.451 0.086 rg 0 792 595 50 re f\n';
  corps += '1 1 1 rg\n';
  L(60, 812, 18, 'F2', 'Laouni AfriMoto GN');
  L(60, 798, 9, 'F1', 'Registre des vehicules - Guinee - laouni-securite-ultime.com');
  corps += '0 0 0 rg\n';

  let y = 740;
  L(60, y, 16, 'F2', att.titre || 'Attestation'); y -= 18;
  if(att.sous_titre) { L(60, y, 11, 'F1', att.sous_titre); y -= 16; }
  y -= 12;
  const lignes = Array.isArray(att.lignes) ? att.lignes.slice(0, 28) : [];
  for(const paire of lignes) {
    const lab = String((paire && paire[0]) || '');
    const val = String((paire && paire[1]) || '');
    if(!lab && !val) { y -= 9; continue; } // une paire vide aère le document
    L(60, y, 11, 'F2', lab + (lab ? ' :' : ''));
    L(225, y, 11, 'F1', val);
    y -= 19;
    if(y < 110) break;
  }
  y = Math.min(y - 14, 96);
  for(const p of String(att.pied || '').split('\n').slice(0, 3)) { L(60, y, 9, 'F1', p); y -= 12; }

  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources '
      + '<< /Font << /F1 4 0 R /F2 6 0 R >> /XObject << /Im1 7 0 R >> '
      + '/ExtGState << /GS1 8 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Length ' + Buffer.byteLength(corps, 'latin1') + ' >>\nstream\n' + corps + '\nendstream',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    // L'image du filigrane : un JPEG embarqué tel quel (DCTDecode).
    '<< /Type /XObject /Subtype /Image /Width 300 /Height 300 /ColorSpace /DeviceRGB '
      + '/BitsPerComponent 8 /Filter /DCTDecode /Length ' + logo.length + ' >>\n'
      + 'stream\n' + logo.toString('latin1') + '\nendstream',
    // L'état graphique du filigrane : 10 % d'opacité, lecture intacte.
    '<< /Type /ExtGState /ca 0.1 /CA 0.1 >>',
  ];
  let pdf = '%PDF-1.4\n'; const offs = [];
  objs.forEach((o, i) => {
    offs.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += (i + 1) + ' 0 obj\n' + o + '\nendobj\n';
  });
  const xref = Buffer.byteLength(pdf, 'latin1');
  pdf += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n'
    + offs.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('')
    + 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
  return Buffer.from(pdf, 'latin1').toString('base64');
}

export default async function handler(req, res) {
  // CORS complet
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if(req.method === 'OPTIONS') return res.status(200).end();
  if(req.method === 'GET') return res.status(200).json({ status: 'ok', message: 'API send-email opérationnelle' });
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { to, subject, text, pieces, attestation } = req.body || {};
    if(!to || !subject) return res.status(400).json({ error: 'to et subject requis' });

    // ══ 13/10/2026 — LES PIÈCES JOINTES (PDF), PAR RESEND SEULEMENT ══
    //
    // Demande du fondateur : « envoi des mails contenant des PDF ». Le champ
    // « pieces » : [{ nom: 'attestation.pdf', contenu_b64: '...', type?: 'application/pdf' }].
    //
    //  · 5 pièces au plus, ~3 Mo en tout : au-delà, Vercel coupe la requête
    //    avant même qu'elle n'arrive ici (sa limite est ~4,5 Mo) ;
    //  · le nom est nettoyé : pas de chemin, pas de caractères de contrôle ;
    //  · ⚠️ PAS DE SECOURS EmailJS pour un courrier à pièces : la béquille ne
    //    sait pas les porter, et un courrier qui annonce un document mais
    //    arrive sans lui est pire qu'un échec franc — on répond l'échec, avec
    //    la raison, et l'appelant réessaie.
    let attachments = [];
    if(pieces != null) {
      if(!Array.isArray(pieces) || pieces.length === 0 || pieces.length > 5) {
        return res.status(400).json({ error: 'pieces : un tableau de 1 à 5 documents' });
      }
      let totalB64 = 0;
      for(const p of pieces) {
        const nom = String((p && p.nom) || '').replace(/[\\/ -]/g, '').trim();
        const b64 = String((p && p.contenu_b64) || '').replace(/\s+/g, '');
        if(!nom || !b64) return res.status(400).json({ error: 'chaque piece exige nom et contenu_b64' });
        if(!/^[A-Za-z0-9+/=]+$/.test(b64)) return res.status(400).json({ error: 'contenu_b64 n est pas du base64 : ' + nom });
        totalB64 += b64.length;
        if(totalB64 > 4 * 1024 * 1024) return res.status(400).json({ error: 'pieces trop lourdes : ~3 Mo au plus par courrier' });
        attachments.push({ filename: nom, content: b64, content_type: String((p && p.type) || 'application/pdf') });
      }
    }

    // L'attestation : la base envoie les champs, le PDF se dessine ici.
    if(attestation != null) {
      if(typeof attestation !== 'object' || Array.isArray(attestation)) {
        return res.status(400).json({ error: 'attestation : un objet { titre, lignes, ... }' });
      }
      const fichier = String(attestation.fichier || 'attestation-afrimoto.pdf')
        .replace(/[\\/ -]/g, '').trim() || 'attestation-afrimoto.pdf';
      attachments.push({ filename: fichier, content: pdfAttestation(attestation), content_type: 'application/pdf' });
    }

    // ── 1. RESEND D'ABORD ───────────────────────────────────────────────────
    let pourquoiResend = '';
    const RESEND_KEY = process.env.RESEND_API_KEY;
    if(!RESEND_KEY) {
      pourquoiResend = 'RESEND_API_KEY manquante dans Vercel env';
    } else {
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
        body{font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;color:#111}
        .header{background:linear-gradient(135deg,#f97316,#ea6c00);padding:20px;border-radius:12px;margin-bottom:20px;text-align:center}
        .header h1{color:#fff;margin:0;font-size:20px}
        .content{background:#f9f9f9;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:14px;line-height:1.6}
        .footer{font-size:11px;color:#999;margin-top:20px;text-align:center}
      </style></head><body>
        <div class="header"><h1>🛡️ Laouni AfriMoto GN</h1><div style="color:rgba(255,255,255,.8);font-size:12px">Registre sécurisé · Guinée</div></div>
        <div class="content">${(text||'').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}</div>
        <div class="footer">Laouni AfriMoto · laouni-securite-ultime.com</div>
      </body></html>`;

      try {
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Laouni AfriMoto <noreply@laouni-securite-ultime.com>',
            to: Array.isArray(to) ? to : [to],
            subject: subject,
            text: text || '',
            html: html,
            // Les documents joints, s'il y en a (voir le bloc « pieces »).
            ...(attachments.length ? { attachments } : {})
          })
        });
        const data = await r.json();
        console.log('[send-email] Réponse Resend:', r.status, JSON.stringify(data));
        if(r.ok) return res.status(200).json({ ok: true, via: 'resend', id: data.id });
        pourquoiResend = `${r.status} ${data.message || 'Erreur Resend'}`;
      } catch(e) {
        pourquoiResend = e.message || 'exception Resend';
      }
    }

    // Un courrier à pièces jointes ne part JAMAIS amputé par la béquille :
    // l'échec est franc, nommé, et l'appelant réessaie quand Resend revit.
    if(attachments.length) {
      return res.status(502).json({
        error: 'Resend a refusé, et un courrier à pièces jointes ne part pas sans elles',
        resend: pourquoiResend,
      });
    }

    // ── 2. EMAILJS EN SECOURS ───────────────────────────────────────────────
    //
    // ⚠️ Le modèle n'accepte qu'UNE adresse : si plusieurs arrivent, on prend
    // la première. Aujourd'hui tous les appelants n'en envoient qu'une.
    console.warn('[send-email] Resend a échoué (' + pourquoiResend + ') — secours EmailJS');
    const premiere = Array.isArray(to) ? String(to[0] || '') : String(to);
    try {
      const r2 = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': EMAILJS.origine,
          'Referer': EMAILJS.origine + '/',
        },
        body: JSON.stringify({
          service_id: EMAILJS.serviceId,
          template_id: EMAILJS.templateId,
          user_id: EMAILJS.publicKey,
          template_params: {
            to_email: premiere,
            titre: String(subject),
            contenu: String(text || ''),
          },
        }),
      });
      const corps = await r2.text();
      console.log('[send-email] Réponse EmailJS:', r2.status, corps.slice(0, 200));
      if(r2.ok) {
        // « secours: true » : le journal saura que Resend est toujours malade.
        return res.status(200).json({ ok: true, via: 'emailjs', secours: true, resend: pourquoiResend });
      }
      return res.status(502).json({
        error: 'Resend et EmailJS ont tous les deux refusé',
        resend: pourquoiResend,
        emailjs: `${r2.status} ${corps.slice(0, 160)}`,
      });
    } catch(e2) {
      return res.status(502).json({
        error: 'Resend et EmailJS ont tous les deux échoué',
        resend: pourquoiResend,
        emailjs: e2.message || 'exception EmailJS',
      });
    }

  } catch(e) {
    console.error('[send-email] Exception:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
