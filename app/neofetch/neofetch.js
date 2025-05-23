/*

    neofetch - neofetch

*/

function getDurationString(start_time) {
    const now = new Date();
    const diffMs = now - start_time;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;

    let result = [];
    
    if (days > 0) result.push(`${days}d`);
    if (remainingHours > 0) result.push(`${remainingHours}h`);
    result.push(`${remainingMinutes}m`);

    return result.join(" ");
}

function getDiskInfo() {
    let file_system_size = getFileSystemSize()
    return Math.round(file_system_size / 1024)+'KB / '+Math.round(MAX_STORAGE / 1024)+'KB ('+Math.round(file_system_size / MAX_STORAGE * 100)+"%) - pfs"
}

// Function to get CPU, GPU, and memory information
function getSystemInfo() {
    const cpuInfo = navigator.hardwareConcurrency;
  
    const memoryInfo = navigator.deviceMemory;
    const totalJSHeap = performance.memory.totalJSHeapSize / (1024 * 1024);
  
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    let gpuInfo = null;
    
    if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            gpuInfo = {
                vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
                renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
            };
        }
    }
  
    return [
        cpuInfo + " cores", 
        memoryInfo ? memoryInfo * 1024 + ' MB' : 'Not supported', 
        totalJSHeap.toFixed(2) + ' MB',
        gpuInfo ? `${gpuInfo.renderer}` : 'Poshlosti GGraphics 1.0.233'       
    ]
}

async function main(args) {
    let [cpu, max_mem, now_mem, gpu] = getSystemInfo()

    writeStdout(`                     
        █████             user@poshlosti
      ███░░░█ █           ------------------
     █░░█░░░██            OS: PoshlostiOS
     █░█░░████            Uptime: ${getDurationString(start_date)}
     █░███░░░░█           Packages: ${(await listPackages()).length} (ppm)
     ██░░░░░░░█           Shell: posh ${(await getInstalledPackage("posh")).version}
    █ █░░░░░░░██          Resolution: ${window.innerWidth}x${window.innerHeight}
      █░░░░░░░░█          Memory: ${now_mem} / ${max_mem}
      █░░░░░░░░█          CPU: ${cpu}
      █░░░░░░░░░█         GPU: ${gpu}
      ██░░░░░░░░███████   Disk (/): ${getDiskInfo()}
       █░░████████▓▓▓█    
  █████████▓▓▓▓▓▓▓▓▓██    
  █▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█     
  █▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██      
  ██▓▓▓▓▓▓▓▓▓▓▓▓▓█        
   █▓▓▓▓▓▓▓▓▓█████        
   ██████████             
`)

    return 0
}
