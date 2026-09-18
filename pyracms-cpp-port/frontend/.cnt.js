const r=require('/w/.cnt.json');for(const t of r.testResults){console.log(t.name.split(/[\/]/).slice(-2).join('/'),t.assertionResults.length,t.status)}
console.log('TOTAL',r.numTotalTests,'failed',r.numFailedTests)
