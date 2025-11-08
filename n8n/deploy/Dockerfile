FROM n8nio/n8n:latest

# Expose default n8n port (Render commonly expects port 80; n8n will use N8N_PORT env if provided)
EXPOSE 80

# Ensure the n8n CLI runs when the container starts; call the start command explicitly
CMD ["n8n", "start"]
