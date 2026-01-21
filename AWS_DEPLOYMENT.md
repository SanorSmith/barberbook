# AWS Deployment Guide for BarberBook

Complete guide to deploy BarberBook Next.js application to AWS.

---

## 🚀 AWS Deployment Options

### **Option 1: AWS Amplify (Recommended - Easiest)**
- ✅ Automatic builds and deployments
- ✅ Built-in CI/CD
- ✅ Custom domain support
- ✅ SSL certificates (free)
- ✅ Environment variables management
- ✅ Preview deployments for branches
- 💰 **Cost**: ~$15-50/month (pay-as-you-go)

### **Option 2: AWS App Runner**
- ✅ Container-based deployment
- ✅ Automatic scaling
- ✅ Load balancing
- ✅ Health checks
- 💰 **Cost**: ~$25-100/month

### **Option 3: AWS ECS + Fargate**
- ✅ Full container orchestration
- ✅ Advanced scaling options
- ✅ VPC integration
- ⚠️ More complex setup
- 💰 **Cost**: ~$30-150/month

### **Option 4: AWS EC2 + PM2**
- ✅ Full server control
- ✅ Cost-effective for high traffic
- ⚠️ Manual server management
- 💰 **Cost**: ~$10-50/month

---

## 📋 OPTION 1: AWS Amplify Deployment (Recommended)

### **Prerequisites**
- AWS Account
- GitHub repository with your code
- Supabase project set up

### **Step 1: Prepare Your Project**

1. **Ensure all environment variables are documented:**
```bash
# .env.local (DO NOT commit this file)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2. **Add build configuration** (already configured in `next.config.mjs`)

3. **Commit and push to GitHub:**
```bash
git add .
git commit -m "Prepare for AWS Amplify deployment"
git push origin main
```

### **Step 2: Deploy to AWS Amplify**

1. **Go to AWS Amplify Console:**
   - Navigate to: https://console.aws.amazon.com/amplify/
   - Click **"New app"** → **"Host web app"**

2. **Connect Repository:**
   - Select **GitHub**
   - Authorize AWS Amplify to access your repositories
   - Select your **barberbook** repository
   - Select branch: **main**

3. **Configure Build Settings:**
   - Amplify will auto-detect Next.js
   - Use this build configuration:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

4. **Add Environment Variables:**
   - Click **"Advanced settings"**
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ **Important**: Mark `SUPABASE_SERVICE_ROLE_KEY` as secret

5. **Deploy:**
   - Click **"Save and deploy"**
   - Wait 5-10 minutes for build and deployment
   - Your app will be live at: `https://[app-id].amplifyapp.com`

### **Step 3: Configure Custom Domain (Optional)**

1. **In Amplify Console:**
   - Go to **"Domain management"**
   - Click **"Add domain"**
   - Enter your domain (e.g., `barberbook.com`)
   - Follow DNS configuration instructions
   - SSL certificate is automatically provisioned

2. **Update DNS:**
   - Add CNAME records provided by Amplify
   - Wait for DNS propagation (5-30 minutes)

### **Step 4: Enable Automatic Deployments**

- **Automatic**: Every push to `main` triggers deployment
- **Branch Previews**: Enable for `dev` or feature branches
- **Pull Request Previews**: Enable for testing before merge

---

## 📋 OPTION 2: AWS App Runner Deployment

### **Prerequisites**
- AWS Account
- Docker installed locally
- GitHub repository

### **Step 1: Create Dockerfile**

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### **Step 2: Update next.config.mjs**

Add standalone output:

```javascript
const nextConfig = {
  output: 'standalone',
  // ... rest of your config
};
```

### **Step 3: Deploy to App Runner**

1. **Push Docker image to ECR:**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [account-id].dkr.ecr.us-east-1.amazonaws.com

# Create ECR repository
aws ecr create-repository --repository-name barberbook

# Build and push
docker build -t barberbook .
docker tag barberbook:latest [account-id].dkr.ecr.us-east-1.amazonaws.com/barberbook:latest
docker push [account-id].dkr.ecr.us-east-1.amazonaws.com/barberbook:latest
```

2. **Create App Runner Service:**
   - Go to AWS App Runner Console
   - Click **"Create service"**
   - Select **"Container registry"** → **"Amazon ECR"**
   - Select your image
   - Configure:
     - Port: `3000`
     - CPU: `1 vCPU`
     - Memory: `2 GB`
   - Add environment variables
   - Click **"Create & deploy"**

---

## 📋 OPTION 3: AWS ECS + Fargate Deployment

### **Step 1: Create ECS Cluster**

```bash
aws ecs create-cluster --cluster-name barberbook-cluster
```

### **Step 2: Create Task Definition**

Create `task-definition.json`:

```json
{
  "family": "barberbook",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "barberbook",
      "image": "[account-id].dkr.ecr.us-east-1.amazonaws.com/barberbook:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NEXT_PUBLIC_SUPABASE_URL",
          "value": "your_supabase_url"
        },
        {
          "name": "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          "value": "your_anon_key"
        }
      ],
      "secrets": [
        {
          "name": "SUPABASE_SERVICE_ROLE_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:barberbook-secrets"
        }
      ]
    }
  ]
}
```

### **Step 3: Create Service with Load Balancer**

```bash
aws ecs create-service \
  --cluster barberbook-cluster \
  --service-name barberbook-service \
  --task-definition barberbook \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=barberbook,containerPort=3000"
```

---

## 📋 OPTION 4: AWS EC2 + PM2 Deployment

### **Step 1: Launch EC2 Instance**

1. **Create EC2 Instance:**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t3.small or t3.medium
   - Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
   - Key Pair: Create or use existing

2. **Connect to Instance:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### **Step 2: Install Dependencies**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### **Step 3: Clone and Setup Project**

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/barberbook.git
cd barberbook

# Install dependencies
sudo npm ci

# Create .env.local
sudo nano .env.local
# Add your environment variables

# Build project
sudo npm run build
```

### **Step 4: Configure PM2**

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'barberbook',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/barberbook',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

Start with PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **Step 5: Configure Nginx**

Create `/etc/nginx/sites-available/barberbook`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/barberbook /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **Step 6: Setup SSL with Let's Encrypt**

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔒 Security Best Practices

### **1. Environment Variables**
- Never commit `.env.local` to Git
- Use AWS Secrets Manager for sensitive data
- Rotate service role keys regularly

### **2. Database Security**
- Keep Supabase RLS policies enabled
- Use connection pooling
- Enable SSL for database connections

### **3. Application Security**
- Enable HTTPS only
- Set up CORS properly
- Use security headers
- Enable rate limiting

### **4. Monitoring**
- Set up CloudWatch logs
- Enable AWS X-Ray for tracing
- Configure alarms for errors
- Monitor costs

---

## 💰 Cost Estimates

### **AWS Amplify**
- Build minutes: ~$0.01/minute
- Hosting: ~$0.15/GB served
- **Estimated**: $15-50/month

### **AWS App Runner**
- Compute: ~$0.064/vCPU-hour
- Memory: ~$0.007/GB-hour
- **Estimated**: $25-100/month

### **AWS ECS + Fargate**
- Fargate: ~$0.04/vCPU-hour + $0.004/GB-hour
- Load Balancer: ~$16/month
- **Estimated**: $30-150/month

### **AWS EC2**
- t3.small: ~$15/month
- t3.medium: ~$30/month
- **Estimated**: $10-50/month

---

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Supabase project set up
- [ ] Database migrations run
- [ ] RLS policies enabled
- [ ] Custom domain configured (optional)
- [ ] SSL certificate installed
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] CI/CD pipeline working
- [ ] Performance testing done

---

## 📚 Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [AWS App Runner Documentation](https://docs.aws.amazon.com/apprunner/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)

---

## 🆘 Troubleshooting

### **Build Fails**
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### **Environment Variables Not Working**
- Ensure variables start with `NEXT_PUBLIC_` for client-side
- Restart service after adding variables
- Check variable names match exactly

### **Database Connection Issues**
- Verify Supabase URL and keys
- Check RLS policies
- Ensure service role key is set for admin operations

### **Performance Issues**
- Enable caching in Nginx
- Use CDN for static assets
- Optimize images
- Enable Next.js image optimization

---

**Need help? Check the AWS documentation or contact AWS support.**
