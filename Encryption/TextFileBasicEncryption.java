import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

import javax.swing.JFileChooser;

public class TextFileBasicEncryption {

	public static String encryptStringByNum(String input, int encrypto) {
		char[] chars = input.toCharArray();
		encrypto = encrypto % 26;
		for (int i = 0; i < chars.length; i++) {
			if (chars[i] >= 'a' && chars[i] <= 'z') {
				chars[i] = (char) (chars[i] + encrypto) > 'z' ? (char) (chars[i] + encrypto - 26) : (char) (chars[i] + encrypto);
			} else if (chars[i] >= 'A' && chars[i] <= 'Z') {
				chars[i] = (char) (chars[i] + encrypto) > 'Z' ? (char) (chars[i] + encrypto - 26) : (char) (chars[i] + encrypto);
			}
		}
		return new String(chars);
	}

	public static String decryptStringByNum(String input, int encrypto) {
		char[] chars = input.toCharArray();
		encrypto = encrypto % 26;
		for (int i = 0; i < chars.length; i++) {
			if (chars[i] >= 'a' && chars[i] <= 'z') {
				chars[i] = (char) (chars[i] - encrypto) < 'a' ? (char) (chars[i] - encrypto + 26) : (char) (chars[i] - encrypto);
			} else if (chars[i] >= 'A' && chars[i] <= 'Z') {
				chars[i] = (char) (chars[i] - encrypto) < 'A' ? (char) (chars[i] - encrypto + 26) : (char) (chars[i] - encrypto);
			}
		}
		return new String(chars);
	}

	public static void encryptFileByNum(int num) { // Choose a file to encrypt
		JFileChooser chooser = new JFileChooser();
		chooser.setCurrentDirectory(new File(System.getProperty("user.dir")));
		int returnVal = chooser.showOpenDialog(null);
		File selectedFile = null;
		if (returnVal == JFileChooser.APPROVE_OPTION) {
			selectedFile = chooser.getSelectedFile();
		}

		// Read File and encrypt
		BufferedReader reader;
		BufferedWriter writer;
		try {
			reader = new BufferedReader(new FileReader(selectedFile.getAbsolutePath()));
			writer = new BufferedWriter(new FileWriter(selectedFile.getAbsolutePath() + ".ency"));
			String line = reader.readLine();
			while (line != null) {
				writer.write(encryptStringByNum(line, num) + "\n");
				line = reader.readLine();
			}
			reader.close();
			writer.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public static void decryptFileByNum(int num) {
		JFileChooser chooser = new JFileChooser();
		chooser.setCurrentDirectory(new File(System.getProperty("user.dir")));
		int returnVal = chooser.showOpenDialog(null);
		File selectedFile = null;
		if (returnVal == JFileChooser.APPROVE_OPTION) {
			selectedFile = chooser.getSelectedFile();
		}

		BufferedReader reader;
		BufferedWriter writer;
		// Read encrypt File and decrypt it
		try {
			reader = new BufferedReader(new FileReader(selectedFile.getAbsolutePath()));
			writer = new BufferedWriter(new FileWriter(selectedFile.getAbsolutePath() + ".decp"));
			String line = reader.readLine();
			while (line != null) {
				writer.write(decryptStringByNum(line, num) + "\n");
				line = reader.readLine();
			}
			reader.close();
			writer.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public static void main(String[] args) {
		encryptFileByNum(4);
		decryptFileByNum(4);
	}
}
