// import pdfMake from 'pdfmake/build/pdfmake'
// import pdfFonts from 'pdfmake/build/vfs_fonts'
// import { TDocumentDefinitions } from 'pdfmake/interfaces'

// // Register fonts
// pdfMake.vfs = pdfFonts.pdfMake.vfs

// export const createPDF = async (order: any) => {
//   const docDefinition: TDocumentDefinitions = {
//     pageSize: {
//       width: 150,
//       height: 90,
//     },
//     pageOrientation: 'landscape',
//     content: [
//       {
//         text: `Thời gian: ${order.createdAt}`,
//         alignment: 'center',
//         fontSize: 6,
//         margin: [0, 0, 0, 5],
//       },
//       {
//         text: `Hóa đơn: ${order.referenceNumber}`,
//         alignment: 'center',
//         fontSize: 6,
//       },
//     ],
//     defaultStyle: {
//       font: 'Roboto',
//     },
//   }

//   return pdfMake.createPdf(docDefinition)
// }
