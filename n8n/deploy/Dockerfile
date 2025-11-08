FROM n8nio/n8n:latest

# Expose default n8n port (Render commonly expects port 80; n8n will use N8N_PORT env if provided)
WORKDIR /data
EXPOSE 5678

# Use ENTRYPOINT + CMD so the runtime invokes n8n reliably
# Run N8n using bash (avoid missing sh edge-cases on some runtimes)
CMD ["bash", "-c", "n8n"]
