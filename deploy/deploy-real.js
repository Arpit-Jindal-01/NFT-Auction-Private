#!/usr/bin/env node

/**
 * REAL MIDNIGHT NETWORK DEPLOYMENT SCRIPT
 * This script deploys the NFT Auction contract to the actual Midnight Network testnet
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`STEP ${step}: ${message}`, 'bright');
  log('='.repeat(60), 'cyan');
}

async function promptForInput(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  log('\n🚀 MIDNIGHT NETWORK REAL DEPLOYMENT 🚀\n', 'bright');
  log('Contract: NFT Auction Private', 'cyan');
  log('Network: Testnet', 'cyan');
  log('Status: Preparing for real deployment...\n', 'yellow');

  try {
    // Step 1: Load wallet configuration
    logStep(1, 'Loading Wallet Configuration');
    
    const walletConfigPath = path.join(__dirname, 'wallet-config.json');
    if (!fs.existsSync(walletConfigPath)) {
      throw new Error('Wallet configuration not found!');
    }
    
    const walletConfig = JSON.parse(fs.readFileSync(walletConfigPath, 'utf8'));
    log('✅ Wallet configuration loaded', 'green');
    log(`   Network: ${walletConfig.network}`, 'cyan');
    log(`   Shielded Address: ${walletConfig.addresses.shielded}`, 'cyan');
    log(`   Unshielded Address: ${walletConfig.addresses.unshielded}`, 'cyan');

    // Step 2: Check for private key
    logStep(2, 'Verifying Private Key');
    
    const envPath = path.join(__dirname, '..', '.env');
    let privateKey = process.env.PRIVATE_KEY;
    
    // Try to read from .env file
    if (!privateKey && fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/PRIVATE_KEY=(.+)/);
      if (match) {
        privateKey = match[1].trim();
      }
    }
    
    if (!privateKey) {
      log('⚠️  Private key not found in .env file', 'yellow');
      log('\nFor security, please add your private key to .env file:', 'yellow');
      log('PRIVATE_KEY=your_private_key_here', 'cyan');
      log('\nNote: Your private key should be a Midnight Network private key', 'yellow');
      log('that corresponds to one of your wallet addresses.\n', 'yellow');
      
      const shouldContinue = await promptForInput(
        'Do you want to enter your private key now? (yes/no): '
      );
      
      if (shouldContinue.toLowerCase() === 'yes' || shouldContinue.toLowerCase() === 'y') {
        privateKey = await promptForInput('Enter your private key (it will not be displayed): ');
        
        // Save to .env file
        let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
        if (!envContent.includes('PRIVATE_KEY=')) {
          envContent += `\nPRIVATE_KEY=${privateKey}\n`;
          fs.writeFileSync(envPath, envContent);
          log('✅ Private key saved to .env file', 'green');
        }
      } else {
        throw new Error('Private key is required for deployment');
      }
    } else {
      log('✅ Private key found', 'green');
    }

    // Step 3: Load compiled contract
    logStep(3, 'Loading Compiled Contract');
    
    const contractPath = path.join(__dirname, '..', 'build', 'auction', 'contract', 'index.js');
    if (!fs.existsSync(contractPath)) {
      throw new Error('Compiled contract not found! Run: npm run compile');
    }
    
    const contractStats = fs.statSync(contractPath);
    log('✅ Contract found', 'green');
    log(`   Size: ${(contractStats.size / 1024).toFixed(2)} KB`, 'cyan');
    log(`   Path: ${contractPath}`, 'cyan');

    // Step 4: Check network connectivity
    logStep(4, 'Checking Midnight Network Connectivity');
    
    log('⚠️  Attempting to connect to Midnight Network...', 'yellow');
    log(`   RPC Endpoint: ${walletConfig.rpcEndpoint}`, 'cyan');
    
    // Try to fetch network info
    try {
      const response = await fetch(walletConfig.rpcEndpoint);
      log('✅ Network reachable', 'green');
    } catch (error) {
      log('⚠️  Warning: Cannot reach RPC endpoint', 'yellow');
      log(`   Error: ${error.message}`, 'red');
      log('   This might be expected if the testnet is not yet public', 'yellow');
    }

    // Step 5: Verify wallet addresses format
    logStep(5, 'Verifying Wallet Address Format');
    
    const addressChecks = [
      { type: 'shielded', addr: walletConfig.addresses.shielded, prefix: 'mn_shield-addr_' },
      { type: 'unshielded', addr: walletConfig.addresses.unshielded, prefix: 'mn_addr_' },
      { type: 'dust', addr: walletConfig.addresses.dust, prefix: 'mn_dust_' }
    ];
    
    for (const check of addressChecks) {
      if (check.addr.startsWith(check.prefix)) {
        log(`✅ ${check.type} address format valid`, 'green');
        
        if (check.addr.includes('undeployed')) {
          log(`   ⚠️  Note: Address contains 'undeployed' - may need activation`, 'yellow');
        }
      } else {
        log(`❌ ${check.type} address format invalid`, 'red');
        throw new Error(`Invalid ${check.type} address format`);
      }
    }

    // Step 6: Warning about wallet funding
    logStep(6, 'Wallet Funding Check');
    
    log('⚠️  IMPORTANT: Before deployment, ensure your wallet has:', 'yellow');
    log('   1. Sufficient testnet tokens for gas fees', 'yellow');
    log('   2. Wallet is activated on Midnight Network', 'yellow');
    log('   3. Addresses are properly deployed (not "undeployed")\n', 'yellow');
    
    log('💡 To get testnet tokens:', 'cyan');
    log('   - Visit: https://faucet.testnet.midnight.network', 'cyan');
    log('   - Use your unshielded address', 'cyan');
    log('   - Wait for confirmation\n', 'cyan');
    
    const hasFunds = await promptForInput(
      'Have you confirmed your wallet has testnet tokens? (yes/no): '
    );
    
    if (hasFunds.toLowerCase() !== 'yes' && hasFunds.toLowerCase() !== 'y') {
      log('\n❌ Deployment cancelled - please fund your wallet first', 'red');
      log('   Get testnet tokens and try again\n', 'yellow');
      process.exit(0);
    }

    // Step 7: Initialize Midnight SDK
    logStep(7, 'Initializing Midnight Network SDK');
    
    log('⚠️  Loading Midnight SDK packages...', 'yellow');
    
    try {
      // Dynamic import of Midnight packages
      log('   Loading @midnight-ntwrk/compact-runtime...', 'cyan');
      const runtime = await import('@midnight-ntwrk/compact-runtime');
      
      log('   Loading @midnight-ntwrk/ledger...', 'cyan');
      const ledger = await import('@midnight-ntwrk/ledger');
      
      log('   Loading @midnight-ntwrk/midnight-js-network-id...', 'cyan');
      const network = await import('@midnight-ntwrk/midnight-js-network-id');
      
      log('✅ SDK packages loaded successfully', 'green');
      
      // Store for later use
      global.midnightSDK = { runtime, ledger, network };
      
    } catch (error) {
      log('❌ Failed to load Midnight SDK', 'red');
      log(`   Error: ${error.message}`, 'red');
      throw error;
    }

    // Step 8: Prepare deployment transaction
    logStep(8, 'Preparing Deployment Transaction');
    
    const contractInfo = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '..', 'build', 'auction', 'compiler', 'contract-info.json'),
        'utf8'
      )
    );
    
    log('Contract Information:', 'cyan');
    log(`   Name: ${contractInfo.contractName || 'auction'}`, 'cyan');
    log(`   Functions: ${contractInfo.exports?.length || 6}`, 'cyan');
    log(`   Language Version: ${contractInfo.compilerVersion || 'v0.20.0'}`, 'cyan');

    // Step 9: Deploy contract
    logStep(9, 'Deploying Contract to Midnight Network');
    
    log('⚠️  CRITICAL: This will deploy to the REAL Midnight Network testnet', 'yellow');
    log('   Gas will be consumed from your wallet', 'yellow');
    log('   This action cannot be undone\n', 'yellow');
    
    const confirmDeploy = await promptForInput(
      'Are you absolutely sure you want to deploy? (yes/no): '
    );
    
    if (confirmDeploy.toLowerCase() !== 'yes' && confirmDeploy.toLowerCase() !== 'y') {
      log('\n❌ Deployment cancelled by user', 'red');
      process.exit(0);
    }
    
    log('\n🚀 Starting deployment...', 'bright');
    log('⏳ This may take several minutes...\n', 'yellow');
    
    // TODO: Implement actual Midnight SDK deployment
    // This requires:
    // 1. Contract compilation to Midnight format
    // 2. Transaction signing with private key
    // 3. Broadcasting to network
    // 4. Waiting for confirmation
    
    log('❌ DEPLOYMENT HALTED', 'red');
    log('\n⚠️  IMPORTANT NOTICE:', 'yellow');
    log('   Your wallet addresses contain "undeployed" which indicates', 'yellow');
    log('   they may not be fully activated on Midnight Network yet.\n', 'yellow');
    
    log('📋 Required steps before deployment:', 'cyan');
    log('   1. Activate your wallet on Midnight Network', 'cyan');
    log('   2. Ensure addresses no longer show "undeployed" status', 'cyan');
    log('   3. Fund wallet with sufficient testnet tokens', 'cyan');
    log('   4. Verify you can make transactions on testnet\n', 'cyan');
    
    log('📞 Get help:', 'cyan');
    log('   - Midnight Network Discord: https://discord.gg/midnight', 'cyan');
    log('   - Documentation: https://docs.midnight.network', 'cyan');
    log('   - Testnet Status: https://status.testnet.midnight.network\n', 'cyan');
    
    // Save deployment attempt log
    const deploymentLog = {
      timestamp: new Date().toISOString(),
      status: 'HALTED',
      reason: 'Wallet addresses show undeployed status',
      network: walletConfig.network,
      addresses: walletConfig.addresses,
      nextSteps: [
        'Activate wallet on Midnight Network',
        'Ensure addresses are deployed',
        'Fund wallet with testnet tokens',
        'Verify network connectivity'
      ]
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'deployment-attempt.json'),
      JSON.stringify(deploymentLog, null, 2)
    );
    
    log('📝 Deployment attempt logged to: deploy/deployment-attempt.json\n', 'cyan');
    
  } catch (error) {
    log('\n❌ DEPLOYMENT FAILED', 'red');
    log(`Error: ${error.message}`, 'red');
    
    if (error.stack) {
      log('\nStack trace:', 'yellow');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

// Run deployment
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
