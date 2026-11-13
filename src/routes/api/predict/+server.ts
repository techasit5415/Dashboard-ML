import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { spawn } from 'node:child_process';
import path from 'node:path';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const payload = await request.json();

    const scriptPath = path.resolve(process.cwd(), 'model', 'predict.py');

    const result = await new Promise<any>((resolve, reject) => {
      const py = spawn('python', [scriptPath], {
        windowsHide: true
      });

      let stdout = '';
      let stderr = '';

      py.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      py.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      py.on('close', (code) => {
        if (code !== 0 && !stdout.trim()) {
          reject(new Error(`Python process exited with code ${code}: ${stderr}`));
          return;
        }

        try {
          const parsed = JSON.parse(stdout.trim());
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse Python JSON output: ${stdout}\nStderr: ${stderr}`));
        }
      });

      py.on('error', (err) => {
        reject(err);
      });

      // Write payload to Python stdin
      py.stdin.write(JSON.stringify(payload));
      py.stdin.end();
    });

    return json(result);
  } catch (error: any) {
    return json(
      {
        status: 'error',
        message: error?.message || 'Inference error',
        probability: 0.5,
        threshold: 0.58,
        isPositive: false,
        confidenceScore: 0,
        recommendationTitle: 'เกิดข้อผิดพลาดในการเรียก Python Model',
        recommendationReason: `Python Execution Failed: ${error?.message || 'Unknown error'}`,
        roiEstimate: {
          expectedSpend: 0,
          expectedCost: 0,
          expectedProfit: 0,
          roiPercentage: 0
        },
        keyDrivers: []
      },
      { status: 500 }
    );
  }
};
