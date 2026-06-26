export class ESCPOSBuilder {
  constructor() {
    this.buffer = [];
  }

  // Initialize printer
  init() {
    this.buffer.push(0x1B, 0x40);
    return this;
  }

  // Add text
  text(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
    return this;
  }

  // Print text and line feed
  textLine(str) {
    this.text(str);
    this.buffer.push(0x0A);
    return this;
  }

  // Line feed
  feed(lines = 1) {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(0x0A);
    }
    return this;
  }

  // Alignment
  align(alignment) {
    const alignMap = {
      'left': 0x00,
      'center': 0x01,
      'right': 0x02
    };
    this.buffer.push(0x1B, 0x61, alignMap[alignment] || 0x00);
    return this;
  }

  // Font style
  bold(on) {
    this.buffer.push(0x1B, 0x45, on ? 0x01 : 0x00);
    return this;
  }

  // Text size
  size(doubleWidth, doubleHeight) {
    let size = 0x00;
    if (doubleWidth) size |= 0x10;
    if (doubleHeight) size |= 0x01;
    this.buffer.push(0x1D, 0x21, size);
    return this;
  }

  // Cut paper
  cut() {
    this.buffer.push(0x1D, 0x56, 0x00);
    return this;
  }

  // Separator line (e.g. ------------------)
  separator(char = '-', length = 32) {
    let line = '';
    for (let i = 0; i < length; i++) {
      line += char;
    }
    this.textLine(line);
    return this;
  }

  // 2-column row (e.g., Total:         $10.00)
  row(col1, col2, totalWidth = 32) {
    const left = col1.toString();
    const right = col2.toString();
    const spacesCount = totalWidth - left.length - right.length;
    let spaces = '';
    if (spacesCount > 0) {
      for (let i = 0; i < spacesCount; i++) {
        spaces += ' ';
      }
    } else {
      spaces = ' ';
    }
    this.textLine(left + spaces + right);
    return this;
  }

  // 4-column row for items (Name, Qty, Rate, Amount)
  itemRow(name, qty, rate, amount, totalWidth = 32) {
    // Basic formatting for 32 chars width (58mm):
    // Name (max 12), Qty (4), Rate (6), Amount (8)
    let n = name.substring(0, 12).padEnd(12, ' ');
    let q = qty.toString().padStart(4, ' ');
    let r = rate.toString().padStart(6, ' ');
    let a = amount.toString().padStart(8, ' ');
    
    // Ensure total is 32 exactly or adjust based on your width
    let line = `${n} ${q} ${r} ${a}`;
    this.textLine(line.substring(0, totalWidth));
    return this;
  }

  // Get final Uint8Array
  build() {
    return new Uint8Array(this.buffer);
  }
}
