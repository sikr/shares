var chartOptions = {
  chart: {
    animation: false,
  },
  legend: {
    align: 'left',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(0, 0, 0, 0.25)',
    borderWidth: '1',
    enabled: true,
    floating: true,
    layout: 'vertical',
    verticalAlign: 'top',
    x: 0,
    y: 100
  },
  // plotOptions: {
  //   series: {
  //     compare: 'percent'
  //   }
  // },
  rangeSelector : {
    selected : 4
  },
  // series: chartData,
  title : {
    text : 'Shares'
  },
  tooltip : {
    crosshairs: [true, false],
    followPointer: false
  },
};

var highchartsOptions = {
  lang: {
    decimalPoint: ',',
    thousandsSep: '.',
    loading: 'Daten werden geladen...',
    months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    shortMonths: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    exportButtonTitle: 'Exportieren',
    printButtonTitle: 'Drucken',
    rangeSelectorFrom: 'Von',
    rangeSelectorTo: 'Bis',
    rangeSelectorZoom: 'Zeitraum',
    downloadPNG: 'Download als PNG-Bild',
    downloadJPEG: 'Download als JPEG-Bild',
    downloadPDF: 'Download als PDF-Dokument',
    downloadSVG: 'Download als SVG-Bild',
    resetZoom: 'Zoom zurücksetzen',
    resetZoomTitle: 'Zoom zurücksetzen'
  }
};