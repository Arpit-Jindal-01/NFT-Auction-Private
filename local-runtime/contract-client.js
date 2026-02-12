#!/usr/bin/env node

/**
 * Contract Interaction Module
 * Handles communication with deployed Compact contracts
 */

import { Contract } from '../build/auction/contract/index.js';
import { createPrivateStateKey } from '@midnight-ntwrk/compact-runtime';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load environment variables
 */
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '..', '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const env = {};
            
            envContent.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const [key, ...valueParts] = trimmed.split('=');
                    if (key && valueParts.length > 0) {
                        env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                    }
                }
            });
            
            return env;
        }
    } catch (error) {
        console.warn('⚠️  Could not load .env file:', error.message);
    }
    
    return {};
}

const env = loadEnv();

// Configuration from environment variables
const config = {
    contractAddress: env.CONTRACT_ADDRESS || 'sample-address-for-local-dev',
    nodeUrl: env.NODE_URL || 'http://localhost:9944',
    walletSeed: env.WALLET_SEED || env.SEED_PHRASE || 'demo seed phrase for local development',
    privateKey: env.PRIVATE_KEY,
};

/**
 * Private State for contract operations
 */
class PrivateState {
    constructor(secretKey, nonce = 0n) {
        this.secretKey = secretKey;
        this.nonce = nonce;
    }

    static random() {
        const secretKey = crypto.randomBytes(32);
        return new PrivateState(secretKey, 0n);
    }

    static fromSeed(seed) {
        const hash = crypto.createHash('sha256').update(seed).digest();
        return new PrivateState(hash, 0n);
    }
}

/**
 * Contract Client for interacting with deployed contracts
 */
export class ContractClient {
    constructor() {
        this.contractAddress = config.contractAddress;
        this.nodeUrl = config.nodeUrl;
        this.privateState = PrivateState.fromSeed(config.walletSeed);
        this.contract = new Contract({});
        
        console.log('✅ Contract Client initialized');
        console.log(`📍 Contract Address: ${this.contractAddress}`);
        console.log(`🌐 Node URL: ${this.nodeUrl}`);
    }

    /**
     * Call getStatus function (simple public function)
     * @returns {Promise<Object>} Transaction result
     */
    async callGetStatus() {
        try {
            console.log('📞 Calling contract.getStatus()...');

            // Create circuit context
            const context = {
                privateStateKey: createPrivateStateKey(this.privateState.secretKey),
                equalityContext: { eq: (a, b) => a === b },
                witnesses: {},
            };

            // Call the circuit
            const result = this.contract.circuits.getStatus(context);

            console.log('✅ Contract call successful');
            console.log('📊 Status:', result);

            // In a real deployment, this would submit to the blockchain
            // For local testing, we simulate a transaction hash
            const txHash = `0x${crypto.randomBytes(32).toString('hex')}`;

            return {
                success: true,
                txHash: txHash,
                status: result.toString(),
                blockNumber: Math.floor(Date.now() / 1000),
                timestamp: new Date().toISOString(),
                contractAddress: this.contractAddress,
                function: 'getStatus',
            };

        } catch (error) {
            console.error('❌ Contract call failed:', error);
            
            return {
                success: false,
                error: error.message,
                stack: error.stack,
            };
        }
    }

    /**
     * Call getTopBid function (another simple public function)
     * @returns {Promise<Object>} Transaction result
     */
    async callGetTopBid() {
        try {
            console.log('📞 Calling contract.getTopBid()...');

            const context = {
                privateStateKey: createPrivateStateKey(this.privateState.secretKey),
                equalityContext: { eq: (a, b) => a === b },
                witnesses: {},
            };

            const result = this.contract.circuits.getTopBid(context);

            console.log('✅ Contract call successful');
            console.log('💰 Top Bid:', result);

            const txHash = `0x${crypto.randomBytes(32).toString('hex')}`;

            return {
                success: true,
                txHash: txHash,
                topBid: result.toString(),
                blockNumber: Math.floor(Date.now() / 1000),
                timestamp: new Date().toISOString(),
                contractAddress: this.contractAddress,
                function: 'getTopBid',
            };

        } catch (error) {
            console.error('❌ Contract call failed:', error);
            
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Submit transaction to Midnight node
     * @param {Object} tx - Transaction object
     * @returns {Promise<Object>} Submission result
     */
    async submitTransaction(tx) {
        try {
            console.log('📤 Submitting transaction to node...');
            console.log(`🌐 Node: ${this.nodeUrl}`);

            // In production, this would make an actual RPC call
            const response = await fetch(this.nodeUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: Date.now(),
                    method: 'author_submitExtrinsic',
                    params: [tx],
                }),
            });

            if (!response.ok) {
                throw new Error(`Node returned ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(`Node error: ${data.error.message || JSON.stringify(data.error)}`);
            }

            console.log('✅ Transaction submitted');
            console.log('📝 Hash:', data.result);

            return {
                success: true,
                txHash: data.result,
            };

        } catch (error) {
            console.error('❌ Transaction submission failed:', error);
            
            // For local development, still return success with simulated hash
            if (this.nodeUrl.includes('localhost')) {
                console.log('💡 Local mode: Simulating successful submission');
                return {
                    success: true,
                    txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
                    note: 'Simulated transaction (local mode)',
                };
            }

            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Generic contract function caller
     * @param {string} functionName - Name of the contract function
     * @param {Array} args - Function arguments
     * @returns {Promise<Object>} Call result
     */
    async callContractFunction(functionName, args = []) {
        try {
            console.log(`📞 Calling contract.${functionName}(${args.join(', ')})...`);

            if (!this.contract.circuits[functionName]) {
                throw new Error(`Function '${functionName}' not found in contract`);
            }

            const context = {
                privateStateKey: createPrivateStateKey(this.privateState.secretKey),
                equalityContext: { eq: (a, b) => a === b },
                witnesses: {},
            };

            const result = this.contract.circuits[functionName](context, ...args);

            console.log('✅ Contract call successful');
            console.log('📊 Result:', result);

            const txHash = `0x${crypto.randomBytes(32).toString('hex')}`;

            return {
                success: true,
                txHash: txHash,
                result: result?.toString() || result,
                blockNumber: Math.floor(Date.now() / 1000),
                timestamp: new Date().toISOString(),
                contractAddress: this.contractAddress,
                function: functionName,
            };

        } catch (error) {
            console.error('❌ Contract call failed:', error);
            
            return {
                success: false,
                error: error.message,
                function: functionName,
            };
        }
    }

    /**
     * Get contract information
     * @returns {Object} Contract info
     */
    getInfo() {
        return {
            contractAddress: this.contractAddress,
            nodeUrl: this.nodeUrl,
            availableFunctions: Object.keys(this.contract.circuits),
        };
    }
}

export default ContractClient;
