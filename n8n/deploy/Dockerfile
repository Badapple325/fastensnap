FROM n8nio/n8n:latest

# Expose default n8n port (Render commonly expects port 80; n8n will use N8N_PORT env if provided)
EXPOSE 80

# Use ENTRYPOINT + CMD so the runtime invokes n8n reliably
ENTRYPOINT ["n8n"]
CMD ["start"]
