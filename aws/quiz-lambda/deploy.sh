#!/bin/bash

FUNCTION_NAME="sedaily-quiz-api"
REGION="us-east-1"

echo "📦 Creating deployment package..."
zip -j function.zip handler.py

echo "🚀 Deploying to Lambda..."
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --zip-file fileb://function.zip \
  --region $REGION

echo "✅ Deployment complete!"
rm function.zip
